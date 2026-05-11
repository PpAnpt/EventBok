import * as svc from "../services/seatmaps.service.js";
import { sendList, sendOne, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listSeatmaps(req, res) {
  try { sendList(res, await svc.listSeatmaps(req.query)); }
  catch (err) { logger.error("listSeatmaps", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getSeatmap(req, res) {
  try {
    const r = await svc.getSeatmap(req.params.id);
    if (!r) return sendError(res, "Seatmap not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("getSeatmap", { error: err?.message }); sendError(res, err?.message, 500); }
}
