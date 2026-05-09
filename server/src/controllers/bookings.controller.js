import * as svc from "../services/bookings.service.js";
import { sendList, sendOne, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listBookings(req, res) {
  try { sendList(res, await svc.listBookings(req.query)); }
  catch (err) { logger.error("listBookings", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getBooking(req, res) {
  try {
    const r = await svc.getBooking(req.params.id);
    if (!r) return sendError(res, "Booking not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("getBooking", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function confirmBooking(req, res) {
  try {
    const r = await svc.confirmBooking(req.params.id);
    if (!r) return sendError(res, "Booking not found or already confirmed", 404);
    sendOk(res, "Booking confirmed");
  } catch (err) { logger.error("confirmBooking", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function cancelBooking(req, res) {
  try {
    const r = await svc.cancelBooking(req.params.id);
    if (!r) return sendError(res, "Booking not found", 404);
    sendOk(res, "Booking cancelled");
  } catch (err) { logger.error("cancelBooking", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function deleteBooking(req, res) {
  try {
    const ok = await svc.deleteBooking(req.params.id);
    if (!ok) return sendError(res, "Booking not found", 404);
    sendOk(res, "Booking deleted");
  } catch (err) { logger.error("deleteBooking", { error: err?.message }); sendError(res, err?.message, 500); }
}

export async function createBooking(req, res) {
  try {
    const result = await svc.createBooking(req.body);
    res.status(201).json({ ok: true, data: result });
  } catch (err) { logger.error("createBooking", { error: err?.message }); sendError(res, err?.message, 500); }
}
