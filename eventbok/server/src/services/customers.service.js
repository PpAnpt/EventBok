import pool from "../db/pool.js";
import jwt from "jsonwebtoken";

export async function loginCustomer(email, phone) {
  const { rows } = await pool.query(
    `SELECT * FROM customers WHERE email=$1 AND phone=$2`,
    [email, phone]
  );
  const customer = rows[0];
  if (!customer) return null;
  const token = jwt.sign(
    { customer_id: customer.customer_id, email: customer.email, role: "customer" },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );
  return { customer, token };
}

export async function getMyBookings(customer_id) {
  const { rows } = await pool.query(
    `SELECT b.*,
       co.concert_name, co.cover_url,
       s.session_name, s.show_date, s.start_time,
       v.venue_name,
       p.total_price, p.payment_status, p.payment_method, p.transaction_id, p.payment_id,
       (SELECT json_agg(json_build_object(
         'seat_no', se.seat_no, 'zone_name', z.zone_name, 'type', z.type, 'qr_code', t.qr_code
       ))
        FROM tickets t
        JOIN seats se ON t.seat_id = se.seat_id
        JOIN zones z ON se.zone_id = z.zone_id
        WHERE t.booking_id = b.booking_id) AS seats
     FROM bookings b
     LEFT JOIN sessions s ON b.session_id = s.session_id
     LEFT JOIN concerts co ON s.concert_id = co.concert_id
     LEFT JOIN venues v ON s.venue_id = v.venue_id
     LEFT JOIN payments p ON p.booking_id = b.booking_id
     WHERE b.customer_id = $1
     ORDER BY b.booking_date DESC`,
    [customer_id]
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function listCustomers({ search } = {}) {
  const conditions = ["1=1"];
  const params = [];
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(firstname ILIKE $${params.length} OR lastname ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const { rows } = await pool.query(
    `SELECT * FROM customers WHERE ${conditions.join(" AND ")} ORDER BY register_date DESC`,
    params
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function getCustomer(id) {
  const { rows } = await pool.query(`SELECT * FROM customers WHERE customer_id = $1`, [id]);
  return rows[0] || null;
}
