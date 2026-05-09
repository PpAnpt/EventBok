import "dotenv/config";
import express from "express";
import cors from "cors";

import logger from "./utils/logger.js";
import { sendError } from "./utils/response.js";
import pool from "./db/pool.js";

import authRoutes from "./routes/auth.routes.js";
import organizersRoutes from "./routes/organizers.routes.js";
import concertsRoutes from "./routes/concerts.routes.js";
import venuesRoutes from "./routes/venues.routes.js";
import sessionsRoutes from "./routes/sessions.routes.js";
import seatmapsRoutes from "./routes/seatmaps.routes.js";
import zonesRoutes from "./routes/zones.routes.js";
import seatsRoutes from "./routes/seats.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import ticketsRoutes from "./routes/tickets.routes.js";
import customersRoutes from "./routes/customers.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

const app = express();

// CORS
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",").map((o) => o.trim()) : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Request logging
const useColor = process.env.NODE_ENV !== "production" && process.stdout.isTTY;
const c = { reset: "\x1b[0m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m", magenta: "\x1b[35m", cyan: "\x1b[36m", red: "\x1b[31m", dim: "\x1b[2m" };
const methodColor = { GET: c.green, POST: c.cyan, PUT: c.yellow, PATCH: c.yellow, DELETE: c.magenta };
const statusColor = (s) => (s >= 500 ? c.red : s >= 400 ? c.yellow : s >= 300 ? c.blue : c.green);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    let msg = `[${req.method}] ${req.originalUrl} ${status} ${duration}ms`;
    if (useColor) {
      const m = methodColor[req.method] || c.dim;
      const s = statusColor(status);
      msg = `${m}[${req.method}]${c.reset} ${req.originalUrl} ${s}${status}${c.reset} ${c.dim}${duration}ms${c.reset}`;
    }
    logger.info(msg);
  });
  next();
});

// Health check
app.get("/health", (_, res) => res.json({ ok: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/organizers", organizersRoutes);
app.use("/api/concerts", concertsRoutes);
app.use("/api/venues", venuesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/seatmaps", seatmapsRoutes);
app.use("/api/zones", zonesRoutes);
app.use("/api/seats", seatsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/reports", reportsRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  logger.error("Unhandled error", { error: err?.message });
  sendError(res, err?.message ?? "Internal server error", 500);
});

const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";
app.listen(port, host, () => logger.info(`EventBok server listening on ${host}:${port}`));

// Cancel pending bookings older than 10 minutes and release seats
async function expireStaleBookings() {
  try {
    const { rows } = await pool.query(
      `UPDATE bookings SET status = 'cancelled'
       WHERE status = 'pending' AND booking_date < NOW() - INTERVAL '10 minutes'
       RETURNING booking_id`
    );
    if (rows.length === 0) return;
    const ids = rows.map((r) => r.booking_id);
    await pool.query(
      `UPDATE seats SET seat_status = 'available'
       WHERE seat_id IN (SELECT seat_id FROM tickets WHERE booking_id = ANY($1))`,
      [ids]
    );
    logger.info(`Expired ${rows.length} stale booking(s): ${ids.join(", ")}`);
  } catch (err) {
    logger.error("Payment expiry job failed", { error: err.message });
  }
}

setInterval(expireStaleBookings, 60_000);
