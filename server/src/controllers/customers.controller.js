import * as svc from "../services/customers.service.js";
import { sendList, sendOne, sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export async function loginCustomer(req, res) {
  try {
    const { email, phone } = req.body;
    const result = await svc.loginCustomer(email, phone);
    if (!result) return sendError(res, "Email หรือเบอร์โทรไม่ถูกต้อง", 401);
    res.json({ success: true, data: result });
  } catch (err) { logger.error("loginCustomer", { error: err?.message }); sendError(res, err?.message, 500); }
}

export async function getMyBookings(req, res) {
  try {
    const result = await svc.getMyBookings(req.user.customer_id);
    sendList(res, result);
  } catch (err) { logger.error("getMyBookings", { error: err?.message }); sendError(res, err?.message, 500); }
}

export async function listCustomers(req, res) {
  try { sendList(res, await svc.listCustomers(req.query)); }
  catch (err) { logger.error("listCustomers", { error: err?.message }); sendError(res, err?.message, 500); }
}
export async function getCustomer(req, res) {
  try {
    const r = await svc.getCustomer(req.params.id);
    if (!r) return sendError(res, "Customer not found", 404);
    sendOne(res, r);
  } catch (err) { logger.error("getCustomer", { error: err?.message }); sendError(res, err?.message, 500); }
}
