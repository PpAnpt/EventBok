import pool from "../db/pool.js";

export async function listPayments({ search, status } = {}) {
  const conditions = ["1=1"];
  const params = [];
  if (status) { params.push(status); conditions.push(`p.payment_status = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(c.firstname ILIKE $${params.length} OR c.lastname ILIKE $${params.length} OR p.transaction_id ILIKE $${params.length} OR co.concert_name ILIKE $${params.length})`);
  }

  const { rows } = await pool.query(
    `SELECT p.*, b.booking_id,
       c.firstname, c.lastname,
       co.concert_name
     FROM payments p
     LEFT JOIN bookings b ON p.booking_id = b.booking_id
     LEFT JOIN customers c ON b.customer_id = c.customer_id
     LEFT JOIN sessions s ON b.session_id = s.session_id
     LEFT JOIN concerts co ON s.concert_id = co.concert_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY p.payment_date DESC`,
    params
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function getPayment(id) {
  const { rows } = await pool.query(
    `SELECT p.*, b.booking_id, c.firstname, c.lastname, co.concert_name
     FROM payments p
     LEFT JOIN bookings b ON p.booking_id = b.booking_id
     LEFT JOIN customers c ON b.customer_id = c.customer_id
     LEFT JOIN sessions s ON b.session_id = s.session_id
     LEFT JOIN concerts co ON s.concert_id = co.concert_id
     WHERE p.payment_id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function updatePaymentStatus(id, payment_status) {
  const { rows } = await pool.query(
    `UPDATE payments SET payment_status=$1 WHERE payment_id=$2 RETURNING *`,
    [payment_status, id]
  );
  return rows[0] || null;
}
