import * as svc from "../services/venues.service.js";
import { sendList, sendOne, sendCreated, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listVenues(req, res) {
  try { sendList(res, await svc.listVenues()); }
  catch (err) { logger.error("listVenues", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getVenue(req, res) {
  try {
    const r = await svc.getVenue(req.params.id);
    if (!r) return sendError(res, "Venue not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("getVenue", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function createVenue(req, res) {
  try { sendCreated(res, await svc.createVenue(req.body)); }
  catch (err) { logger.error("createVenue", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function updateVenue(req, res) {
  try {
    const r = await svc.updateVenue(req.params.id, req.body);
    if (!r) return sendError(res, "Venue not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("updateVenue", { error: err?.message }); sendError(res, err?.message, 500); }
}
