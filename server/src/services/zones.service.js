import pool from "../db/pool.js";

export async function listZones({ seatmap_id } = {}) {
  const conditions = ["1=1"];
  const params = [];
  if (seatmap_id) { params.push(seatmap_id); conditions.push(`z.seatmap_id = $${params.length}`); }

  const { rows } = await pool.query(
    `SELECT z.*,
       (SELECT json_agg(json_build_object('seat_id', s.seat_id, 'seat_no', s.seat_no, 'seat_status', s.seat_status))
        FROM seats s WHERE s.zone_id = z.zone_id) AS seats
     FROM zones z
     WHERE ${conditions.join(" AND ")}
     ORDER BY z.type DESC`,
    params
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function getZone(id) {
  const { rows } = await pool.query(`SELECT * FROM zones WHERE zone_id = $1`, [id]);
  return rows[0] || null;
}
