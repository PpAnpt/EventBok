import pool from "../db/pool.js";

export async function listVenues() {
  const { rows } = await pool.query(`SELECT * FROM venues ORDER BY venue_name`);
  return { data: rows, meta: { total: rows.length } };
}

export async function getVenue(id) {
  const { rows } = await pool.query(`SELECT * FROM venues WHERE venue_id = $1`, [id]);
  return rows[0] || null;
}

export async function createVenue(data) {
  const { venue_name, location, capacity } = data;
  const { rows } = await pool.query(
    `INSERT INTO venues (venue_name, location, capacity) VALUES ($1, $2, $3) RETURNING *`,
    [venue_name, location, capacity]
  );
  return rows[0];
}

export async function updateVenue(id, data) {
  const { venue_name, location, capacity } = data;
  const { rows } = await pool.query(
    `UPDATE venues SET venue_name=$1, location=$2, capacity=$3 WHERE venue_id=$4 RETURNING *`,
    [venue_name, location, capacity, id]
  );
  return rows[0] || null;
}
