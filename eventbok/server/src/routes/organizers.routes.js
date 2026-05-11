import { Router } from "express";
import pool from "../db/pool.js";
import jwt from "jsonwebtoken";
import { sendList, sendOne, sendCreated, sendOk, sendError } from "../utils/response.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();

// ── Organizer Login ──────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, phone_number } = req.body;
    const { rows } = await pool.query(
      `SELECT * FROM organizers WHERE contact_email=$1 AND phone_number=$2`,
      [email, phone_number]
    );
    if (!rows[0]) return sendError(res, "อีเมลหรือเบอร์โทรไม่ถูกต้อง", 401);
    const organizer = rows[0];
    const token = jwt.sign(
      { organizer_id: organizer.organizer_id, email: organizer.contact_email, role: "organizer" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    res.json({ success: true, data: { organizer, token } });
  } catch (err) { sendError(res, err.message, 500); }
});

// ── Organizer: My Concerts ───────────────────────────────────
router.get("/me/concerts", authMiddleware, requireRole("organizer"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, v.venue_name, v.location,
         (SELECT json_agg(json_build_object(
           'session_id', s.session_id, 'session_name', s.session_name,
           'show_date', s.show_date::TEXT, 'start_time', s.start_time, 'end_time', s.end_time
         ) ORDER BY s.show_date) FROM sessions s WHERE s.concert_id = c.concert_id) AS sessions
       FROM concerts c
       LEFT JOIN venues v ON c.venue_id = v.venue_id
       WHERE c.organizer_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.organizer_id]
    );
    sendList(res, { data: rows, meta: { total: rows.length } });
  } catch (err) { sendError(res, err.message, 500); }
});

// ── Organizer: My Bookings ───────────────────────────────────
router.get("/me/bookings", authMiddleware, requireRole("organizer"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, cu.firstname, cu.lastname, cu.email AS customer_email,
         co.concert_name, s.session_name, s.show_date,
         p.total_price, p.payment_status, p.payment_method
       FROM bookings b
       JOIN sessions s ON b.session_id = s.session_id
       JOIN concerts co ON s.concert_id = co.concert_id
       JOIN customers cu ON b.customer_id = cu.customer_id
       LEFT JOIN payments p ON p.booking_id = b.booking_id
       WHERE co.organizer_id = $1
       ORDER BY b.booking_date DESC`,
      [req.user.organizer_id]
    );
    sendList(res, { data: rows, meta: { total: rows.length } });
  } catch (err) { sendError(res, err.message, 500); }
});

// ── Organizer: My Stats ──────────────────────────────────────
router.get("/me/stats", authMiddleware, requireRole("organizer"), async (req, res) => {
  try {
    const [concerts, revenue, bookings] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM concerts WHERE organizer_id=$1`, [req.user.organizer_id]),
      pool.query(
        `SELECT COALESCE(SUM(p.total_price),0) AS total
         FROM payments p
         JOIN bookings b ON p.booking_id = b.booking_id
         JOIN sessions s ON b.session_id = s.session_id
         JOIN concerts c ON s.concert_id = c.concert_id
         WHERE c.organizer_id=$1 AND p.payment_status='completed'`,
        [req.user.organizer_id]
      ),
      pool.query(
        `SELECT COUNT(*) FROM bookings b
         JOIN sessions s ON b.session_id = s.session_id
         JOIN concerts c ON s.concert_id = c.concert_id
         WHERE c.organizer_id=$1 AND b.status='confirmed'`,
        [req.user.organizer_id]
      ),
    ]);
    res.json({
      success: true,
      data: {
        total_concerts: parseInt(concerts.rows[0].count),
        total_revenue: parseFloat(revenue.rows[0].total),
        confirmed_bookings: parseInt(bookings.rows[0].count),
      },
    });
  } catch (err) { sendError(res, err.message, 500); }
});

// ── Public list ──────────────────────────────────────────────
router.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM organizers ORDER BY organizer_name");
  sendList(res, { data: rows, meta: { total: rows.length } });
});

router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { organizer_name, contact_email, phone_number } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO organizers (organizer_name, contact_email, phone_number) VALUES ($1,$2,$3) RETURNING *`,
      [organizer_name, contact_email, phone_number]
    );
    sendCreated(res, rows[0]);
  } catch (err) { sendError(res, err.message, 500); }
});

router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { organizer_name, contact_email, phone_number } = req.body;
    const { rows } = await pool.query(
      `UPDATE organizers SET organizer_name=$1, contact_email=$2, phone_number=$3 WHERE organizer_id=$4 RETURNING *`,
      [organizer_name, contact_email, phone_number, req.params.id]
    );
    if (!rows[0]) return sendError(res, "Not found", 404);
    sendOne(res, rows[0]);
  } catch (err) { sendError(res, err.message, 500); }
});

router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: concerts } = await client.query(
      `SELECT concert_id FROM concerts WHERE organizer_id=$1`, [req.params.id]
    );
    if (concerts.length > 0) {
      const ids = concerts.map((c) => c.concert_id);
      await client.query(`DELETE FROM sessions WHERE concert_id = ANY($1)`, [ids]);
      await client.query(`DELETE FROM concerts WHERE concert_id = ANY($1)`, [ids]);
    }
    const { rowCount } = await client.query("DELETE FROM organizers WHERE organizer_id=$1", [req.params.id]);
    if (!rowCount) { await client.query("ROLLBACK"); return sendError(res, "Not found", 404); }
    await client.query("COMMIT");
    sendOk(res, "Deleted");
  } catch (err) {
    await client.query("ROLLBACK");
    sendError(res, err.message, 500);
  } finally {
    client.release();
  }
});

export default router;
