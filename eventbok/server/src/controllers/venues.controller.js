import * as svc from "../services/venues.service.js";
import { sendList, sendOne, sendCreated, sendOk, sendError } from "../utils/response.js";
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
export async function getVenueZones(req, res) {
  try {
    const zones = await svc.getVenueZones(req.params.id);
    sendList(res, { data: zones, meta: { total: zones.length } });
  } catch (err) { logger.error("getVenueZones", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function updateVenue(req, res) {
  try {
    const r = await svc.updateVenue(req.params.id, req.body);
    if (!r) return sendError(res, "Venue not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("updateVenue", { error: err?.message }); sendError(res, err?.message, 500); }
}

export async function deleteVenue(req, res) {
  try {
    const ok = await svc.deleteVenue(req.params.id);
    if (!ok) return sendError(res, "Venue not found", 404);
    sendOk(res, "Deleted");
  } catch (err) { logger.error("deleteVenue", { error: err?.message }); sendError(res, err?.message, 500); }
}
