import pool from "../db/pool.js";

export async function listSessions({ concert_id } = {}) {
  const conditions = ["1=1"];
  const params = [];
  if (concert_id) { params.push(concert_id); conditions.push(`s.concert_id = $${params.length}`); }

  const { rows } = await pool.query(
    `SELECT s.*, c.concert_name, v.venue_name
     FROM sessions s
     LEFT JOIN concerts c ON s.concert_id = c.concert_id
     LEFT JOIN venues v ON s.venue_id = v.venue_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY s.show_date, s.start_time`,
    params
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function createSession(data) {
  const { session_name, show_date, start_time, end_time, concert_id, venue_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO sessions (session_name, show_date, start_time, end_time, concert_id, venue_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [session_name, show_date, start_time, end_time, concert_id, venue_id]
  );
  return rows[0];
}

export async function updateSession(id, data) {
  const { session_name, show_date, start_time, end_time } = data;
  const { rows } = await pool.query(
    `UPDATE sessions SET session_name=$1, show_date=$2, start_time=$3, end_time=$4
     WHERE session_id=$5 RETURNING *`,
    [session_name, show_date, start_time, end_time, id]
  );
  return rows[0] || null;
}

export async function deleteSession(id) {
  const { rowCount } = await pool.query(`DELETE FROM sessions WHERE session_id=$1`, [id]);
  return rowCount > 0;
}
