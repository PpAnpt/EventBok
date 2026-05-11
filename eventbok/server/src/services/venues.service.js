import pool from "../db/pool.js";
import { SEAT_TEMPLATES } from "../utils/seatTemplates.js";

export async function listVenues() {
  const { rows } = await pool.query(`
    SELECT v.*,
      (SELECT COUNT(*) FROM seatmaps sm WHERE sm.venue_id = v.venue_id) > 0 AS has_seatmap
    FROM venues v ORDER BY v.venue_name`);
  return { data: rows, meta: { total: rows.length } };
}

export async function getVenue(id) {
  const { rows } = await pool.query(`SELECT * FROM venues WHERE venue_id = $1`, [id]);
  return rows[0] || null;
}

export async function getVenueZones(id) {
  const { rows } = await pool.query(
    `SELECT z.zone_id, z.zone_name, z.type, z.price, z.capacity
     FROM zones z
     JOIN seatmaps sm ON z.seatmap_id = sm.seatmap_id
     WHERE sm.venue_id = $1
     ORDER BY CASE z.type WHEN 'vip' THEN 1 WHEN 'premium' THEN 2 ELSE 3 END, z.zone_name`,
    [id]
  );
  return rows;
}

export async function createVenue(data) {
  const { venue_name, location, capacity, capacity_template = 500 } = data;
  const template = SEAT_TEMPLATES[capacity_template] || SEAT_TEMPLATES[500];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO venues (venue_name, location, capacity, capacity_template) VALUES ($1,$2,$3,$4) RETURNING *`,
      [venue_name, location, capacity, capacity_template]
    );
    const venue = rows[0];

    const { rows: smRows } = await client.query(
      `INSERT INTO seatmaps (map_name, template, venue_id) VALUES ($1,$2,$3) RETURNING seatmap_id`,
      [`${venue_name} Seatmap`, template.sqlTemplate, venue.venue_id]
    );
    const seatmap_id = smRows[0].seatmap_id;

    for (const zoneConfig of template.zones) {
      const cap = zoneConfig.rows.length * zoneConfig.seatsPerRow;
      const { rows: zRows } = await client.query(
        `INSERT INTO zones (zone_name, type, price, capacity, rows, seatmap_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING zone_id`,
        [zoneConfig.name, zoneConfig.type, template.defaultPrices[zoneConfig.name] ?? 1000, cap, zoneConfig.rows, seatmap_id]
      );
      const zone_id = zRows[0].zone_id;

      const vals = [], prms = [];
      let pi = 1;
      for (const row of zoneConfig.rows) {
        for (let n = 1; n <= zoneConfig.seatsPerRow; n++) {
          vals.push(`($${pi++},$${pi++})`);
          prms.push(`${row}${n}`, zone_id);
        }
      }
      if (vals.length > 0) {
        await client.query(`INSERT INTO seats (seat_no, zone_id) VALUES ${vals.join(",")}`, prms);
      }
    }

    await client.query("COMMIT");
    return venue;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateVenue(id, data) {
  const { venue_name, location, capacity } = data;
  const { rows } = await pool.query(
    `UPDATE venues SET venue_name=$1, location=$2, capacity=$3 WHERE venue_id=$4 RETURNING *`,
    [venue_name, location, capacity, id]
  );
  return rows[0] || null;
}

export async function deleteVenue(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM sessions WHERE venue_id=$1`, [id]);
    await client.query(`DELETE FROM concerts WHERE venue_id=$1`, [id]);
    const { rowCount } = await client.query("DELETE FROM venues WHERE venue_id=$1", [id]);
    await client.query("COMMIT");
    return rowCount > 0;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
