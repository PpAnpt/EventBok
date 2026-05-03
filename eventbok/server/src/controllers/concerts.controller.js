import * as concertsService from "../services/concerts.service.js";
import { sendList, sendOne, sendCreated, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listConcerts(req, res) {
  try {
    const result = await concertsService.listConcerts(req.query);
    sendList(res, result);
  } catch (err) {
    logger.error("listConcerts failed", { error: err?.message });
    sendError(res, err?.message, 500);
  }
}

export async function getConcert(req, res) {
  try {
    const result = await concertsService.getConcert(req.params.id);
    if (!result) return sendError(res, "Concert not found", 404);
    sendOne(res, result);
  } catch (err) {
    logger.error("getConcert failed", { error: err?.message });
    sendError(res, err?.message, 500);
  }
}

export async function createConcert(req, res) {
  try {
    const result = await concertsService.createConcert(req.body);
    sendCreated(res, result);
  } catch (err) {
    logger.error("createConcert failed", { error: err?.message });
    sendError(res, err?.message, 500);
  }
}

export async function updateConcert(req, res) {
  try {
    const result = await concertsService.updateConcert(req.params.id, req.body);
    if (!result) return sendError(res, "Concert not found", 404);
    sendOne(res, result);
  } catch (err) {
    logger.error("updateConcert failed", { error: err?.message });
    sendError(res, err?.message, 500);
  }
}

export async function deleteConcert(req, res) {
  try {
    const ok = await concertsService.deleteConcert(req.params.id);
    if (!ok) return sendError(res, "Concert not found", 404);
    sendOk(res, "Concert deleted");
  } catch (err) {
    logger.error("deleteConcert failed", { error: err?.message });
    sendError(res, err?.message, 500);
  }
}
