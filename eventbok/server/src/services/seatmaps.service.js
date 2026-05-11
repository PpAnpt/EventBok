import pool from "../db/pool.js";

export async function listSeatmaps({ venue_id } = {}) {
  const conditions = ["1=1"];
  const params = [];
  if (venue_id) { params.push(venue_id); conditions.push(`sm.venue_id = $${params.length}`); }

  const { rows } = await pool.query(
    `SELECT sm.*, v.venue_name FROM seatmaps sm
     LEFT JOIN venues v ON sm.venue_id = v.venue_id
     WHERE ${conditions.join(" AND ")}`,
    params
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function getSeatmap(id) {
  const { rows } = await pool.query(
    `SELECT sm.*, v.venue_name,
       (SELECT json_agg(json_build_object(
          'zone_id', z.zone_id, 'zone_name', z.zone_name, 'type', z.type,
          'price', z.price, 'capacity', z.capacity, 'rows', z.rows, 'color', z.color))
        FROM zones z WHERE z.seatmap_id = sm.seatmap_id) AS zones
     FROM seatmaps sm
     LEFT JOIN venues v ON sm.venue_id = v.venue_id
     WHERE sm.seatmap_id = $1`,
    [id]
  );
  return rows[0] || null;
}
