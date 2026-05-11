import * as svc from "../services/sessions.service.js";
import { sendList, sendOne, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listSessions(req, res) {
  try { sendList(res, await svc.listSessions(req.query)); }
  catch (err) { logger.error("listSessions", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function createSession(req, res) {
  try { sendCreated(res, await svc.createSession(req.body)); }
  catch (err) { logger.error("createSession", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function updateSession(req, res) {
  try {
    const r = await svc.updateSession(req.params.id, req.body);
    if (!r) return sendError(res, "Session not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("updateSession", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function deleteSession(req, res) {
  try {
    const ok = await svc.deleteSession(req.params.id);
    if (!ok) return sendError(res, "Session not found", 404);
    sendOk(res, "Session deleted");
  } catch (err) { logger.error("deleteSession", { error: err?.message }); sendError(res, err?.message, 500); }
}
