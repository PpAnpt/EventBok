import pool from "../db/pool.js";

export async function listSeats({ zone_id, session_id } = {}) {
  let query, params;

  if (session_id) {
    params = [session_id];
    query = `
      SELECT s.*, z.zone_name, z.type, z.price,
        CASE WHEN t.ticket_id IS NOT NULL AND b.status = 'confirmed' THEN 'booked'
             WHEN t.ticket_id IS NOT NULL AND b.status = 'pending'   THEN 'reserved'
             ELSE 'available' END AS display_status
      FROM seats s
      LEFT JOIN zones z ON s.zone_id = z.zone_id
      LEFT JOIN tickets t ON t.seat_id = s.seat_id AND t.session_id = $1
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      ORDER BY z.type, s.seat_no`;
  } else if (zone_id) {
    params = [zone_id];
    query = `SELECT * FROM seats WHERE zone_id = $1 ORDER BY seat_no`;
  } else {
    params = [];
    query = `SELECT s.*, z.zone_name, z.type, z.price FROM seats s LEFT JOIN zones z ON s.zone_id = z.zone_id ORDER BY z.type, s.seat_no`;
  }

  const { rows } = await pool.query(query, params);
  return { data: rows, meta: { total: rows.length } };
}

export async function updateSeatStatus(id, seat_status) {
  const { rows } = await pool.query(
    `UPDATE seats SET seat_status=$1 WHERE seat_id=$2 RETURNING *`,
    [seat_status, id]
  );
  return rows[0] || null;
}
