import { Router } from "express";
import pool from "../db/pool.js";
import { sendList } from "../utils/response.js";

const router = Router();
router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM organizers ORDER BY organizer_name");
  sendList(res, { data: rows, meta: { total: rows.length } });
});
export default router;
