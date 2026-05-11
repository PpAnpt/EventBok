import pool from "../db/pool.js";
import { sendBookingConfirmation } from "../utils/mailer.js";

export async function listBookings({ search, status } = {}) {
  const conditions = ["1=1"];
  const params = [];
  if (status) { params.push(status); conditions.push(`b.status = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(c.firstname ILIKE $${params.length} OR c.lastname ILIKE $${params.length} OR co.concert_name ILIKE $${params.length})`);
  }

  const { rows } = await pool.query(
    `SELECT b.*,
       c.firstname, c.lastname, c.email,
       co.concert_name,
       s.session_name, s.show_date,
       (SELECT json_agg(json_build_object('seat_no', se.seat_no, 'zone_name', z.zone_name))
        FROM tickets t2
        JOIN seats se ON t2.seat_id = se.seat_id
        JOIN zones z ON se.zone_id = z.zone_id
        WHERE t2.booking_id = b.booking_id) AS seats,
       p.total_price, p.payment_status
     FROM bookings b
     LEFT JOIN customers c ON b.customer_id = c.customer_id
     LEFT JOIN sessions s ON b.session_id = s.session_id
     LEFT JOIN concerts co ON s.concert_id = co.concert_id
     LEFT JOIN payments p ON p.booking_id = b.booking_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY b.booking_date DESC`,
    params
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function getBooking(id) {
  const { rows } = await pool.query(
    `SELECT b.*, c.firstname, c.lastname, c.email, co.concert_name, s.session_name, s.show_date, p.total_price, p.payment_status
     FROM bookings b
     LEFT JOIN customers c ON b.customer_id = c.customer_id
     LEFT JOIN sessions s ON b.session_id = s.session_id
     LEFT JOIN concerts co ON s.concert_id = co.concert_id
     LEFT JOIN payments p ON p.booking_id = b.booking_id
     WHERE b.booking_id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function confirmBooking(id) {
  const { rows } = await pool.query(
    `UPDATE bookings SET status='confirmed' WHERE booking_id=$1 AND status='pending' RETURNING *`,
    [id]
  );
  if (rows[0]) {
    await pool.query(
      `UPDATE payments SET payment_status='completed' WHERE booking_id=$1`,
      [id]
    );
    await pool.query(
      `UPDATE seats SET seat_status='booked'
       WHERE seat_id IN (SELECT seat_id FROM tickets WHERE booking_id=$1)`,
      [id]
    );
  }
  return rows[0] || null;
}

export async function cancelBooking(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE bookings SET status='cancelled' WHERE booking_id=$1 AND status != 'cancelled' RETURNING *`,
      [id]
    );
    if (rows.length > 0) {
      await client.query(
        `UPDATE seats SET seat_status='available'
         WHERE seat_id IN (SELECT seat_id FROM tickets WHERE booking_id=$1)`,
        [id]
      );
    }
    await client.query("COMMIT");
    return rows[0] || null;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteBooking(id) {
  const { rowCount } = await pool.query(`DELETE FROM bookings WHERE booking_id=$1`, [id]);
  return rowCount > 0;
}

export async function createBooking({ firstname, lastname, email, phone, date_of_birth, session_id, seat_ids, payment_method }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find or create customer
    let customer = (await client.query(`SELECT * FROM customers WHERE email=$1`, [email])).rows[0];
    if (!customer) {
      customer = (await client.query(
        `INSERT INTO customers (firstname, lastname, email, phone, date_of_birth) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [firstname, lastname, email, phone || "000-000-0000", date_of_birth || "2000-01-01"]
      )).rows[0];
    }

    // Create booking
    const booking = (await client.query(
      `INSERT INTO bookings (customer_id, session_id) VALUES ($1,$2) RETURNING *`,
      [customer.customer_id, session_id]
    )).rows[0];

    // Get seat info (price from concert_zone_prices, fallback to zone default)
    const seats = (await client.query(
      `SELECT s.seat_id, s.seat_no, COALESCE(czp.price, z.price) AS price, z.type
       FROM seats s
       JOIN zones z ON s.zone_id = z.zone_id
       LEFT JOIN sessions sess ON sess.session_id = $2
       LEFT JOIN concert_zone_prices czp ON czp.concert_id = sess.concert_id AND czp.zone_id = z.zone_id
       WHERE s.seat_id = ANY($1)`,
      [seat_ids, session_id]
    )).rows;

    for (const seat of seats) {
      const qr = `QR-${booking.booking_id}-${seat.seat_id}-${Date.now()}`;
      await client.query(
        `INSERT INTO tickets (ticket_type, qr_code, booking_id, seat_id, session_id) VALUES ($1,$2,$3,$4,$5)`,
        [seat.type, qr, booking.booking_id, seat.seat_id, session_id]
      );
      await client.query(`UPDATE seats SET seat_status='reserved' WHERE seat_id=$1`, [seat.seat_id]);
    }

    const total_price = seats.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const txn = `TXN${Date.now()}`;

    const payment = (await client.query(
      `INSERT INTO payments (total_price, payment_method, payment_status, transaction_id, booking_id) VALUES ($1,$2,'pending',$3,$4) RETURNING *`,
      [total_price, payment_method || "credit_card", txn, booking.booking_id]
    )).rows[0];

    await client.query("COMMIT");

    // Fetch session info for email
    const sessionRow = (await pool.query(
      `SELECT s.session_name, s.show_date, s.start_time, co.concert_name
       FROM sessions s JOIN concerts co ON s.concert_id = co.concert_id
       WHERE s.session_id = $1`, [session_id]
    )).rows[0];

    // Send confirmation email (non-blocking)
    sendBookingConfirmation({
      to: customer.email,
      booking,
      payment,
      concert: sessionRow?.concert_name ?? "Concert",
      session: sessionRow ?? { session_name: "", show_date: "", start_time: "" },
      seats,
    }).catch(() => {});

    return { booking, payment, customer, seats };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
