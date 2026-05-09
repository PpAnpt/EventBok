import * as svc from "../services/payments.service.js";
import { sendList, sendOne, sendOk, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function listPayments(req, res) {
  try { sendList(res, await svc.listPayments(req.query)); }
  catch (err) { logger.error("listPayments", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getPayment(req, res) {
  try {
    const r = await svc.getPayment(req.params.id);
    if (!r) return sendError(res, "Payment not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("getPayment", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function updatePaymentStatus(req, res) {
  try {
    const r = await svc.updatePaymentStatus(req.params.id, req.body.status);
    if (!r) return sendError(res, "Payment not found", 404);
    sendOk(res, "Payment status updated");
  } catch (err) { logger.error("updatePaymentStatus", { error: err?.message }); sendError(res, err?.message, 500); }
}
