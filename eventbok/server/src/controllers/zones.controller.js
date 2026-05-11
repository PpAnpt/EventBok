import * as svc from "../services/zones.service.js";
import { sendList, sendOne, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listZones(req, res) {
  try { sendList(res, await svc.listZones(req.query)); }
  catch (err) { logger.error("listZones", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getZone(req, res) {
  try {
    const r = await svc.getZone(req.params.id);
    if (!r) return sendError(res, "Zone not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("getZone", { error: err?.message }); sendError(res, err?.message, 500); }
}
