import * as svc from "../services/reports.service.js";
import { sendOne, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function getSummary(req, res) {
  try { sendOne(res, await svc.getSummary()); }
  catch (err) { logger.error("getSummary", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getRevenue(req, res) {
  try { sendOne(res, await svc.getRevenue(req.query)); }
  catch (err) { logger.error("getRevenue", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getBookingStats(req, res) {
  try { sendOne(res, await svc.getBookingStats(req.query)); }
  catch (err) { logger.error("getBookingStats", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getTopConcerts(req, res) {
  try { sendOne(res, await svc.getTopConcerts()); }
  catch (err) { logger.error("getTopConcerts", { error: err?.message }); sendError(res, err?.message, 500); }
}
