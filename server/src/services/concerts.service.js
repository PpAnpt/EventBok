import pool from "../db/pool.js";

export async function listConcerts({ search, status, organizer_id } = {}) {
  const conditions = ["1=1"];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(c.concert_name ILIKE $${params.length} OR c.artist_name ILIKE $${params.length})`);
  }
  if (status) {
    params.push(status);
    conditions.push(`c.status = $${params.length}`);
  }
  if (organizer_id) {
    params.push(organizer_id);
    conditions.push(`c.organizer_id = $${params.length}`);
  }

  const { rows } = await pool.query(
    `SELECT c.*, o.organizer_name, v.venue_name,
      (SELECT json_agg(json_build_object('session_id', s.session_id, 'session_name', s.session_name, 'show_date', s.show_date, 'start_time', s.start_time))
       FROM sessions s WHERE s.concert_id = c.concert_id) as sessions
     FROM concerts c
     LEFT JOIN organizers o ON c.organizer_id = o.organizer_id
     LEFT JOIN venues v ON c.venue_id = v.venue_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY c.created_at DESC`,
    params
  );
  return { data: rows, meta: { total: rows.length } };
}

export async function getConcert(id) {
  const { rows } = await pool.query(
    `SELECT c.*, o.organizer_name, v.venue_name, v.location, v.capacity,
      (SELECT json_agg(json_build_object(
        'session_id', s.session_id, 'session_name', s.session_name,
        'show_date', s.show_date, 'start_time', s.start_time, 'end_time', s.end_time
      )) FROM sessions s WHERE s.concert_id = c.concert_id) as sessions
     FROM concerts c
     LEFT JOIN organizers o ON c.organizer_id = o.organizer_id
     LEFT JOIN venues v ON c.venue_id = v.venue_id
     WHERE c.concert_id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function createConcert(data) {
  const { concert_name, artist_name, description, organizer_id, venue_id, status = "upcoming", cover_url } = data;
  const { rows } = await pool.query(
    `INSERT INTO concerts (concert_name, artist_name, description, organizer_id, venue_id, status, cover_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [concert_name, artist_name, description, organizer_id, venue_id, status, cover_url || null]
  );
  return rows[0];
}

export async function updateConcert(id, data) {
  const { concert_name, artist_name, description, venue_id, status, cover_url } = data;
  const { rows } = await pool.query(
    `UPDATE concerts SET concert_name=$1, artist_name=$2, description=$3, venue_id=$4, status=$5, cover_url=$6, updated_at=NOW()
     WHERE concert_id=$7 RETURNING *`,
    [concert_name, artist_name, description, venue_id, status, cover_url || null, id]
  );
  return rows[0] || null;
}

export async function deleteConcert(id) {
  const { rowCount } = await pool.query("DELETE FROM concerts WHERE concert_id=$1", [id]);
  return rowCount > 0;
}
