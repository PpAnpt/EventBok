import * as svc from "../services/seats.service.js";
import { sendList, sendOne, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listSeats(req, res) {
  try { sendList(res, await svc.listSeats(req.query)); }
  catch (err) { logger.error("listSeats", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function updateSeatStatus(req, res) {
  try {
    const r = await svc.updateSeatStatus(req.params.id, req.body.seat_status);
    if (!r) return sendError(res, "Seat not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("updateSeatStatus", { error: err?.message }); sendError(res, err?.message, 500); }
}
