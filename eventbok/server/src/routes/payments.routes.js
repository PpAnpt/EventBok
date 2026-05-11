import { Router } from "express";
import * as ctrl from "../controllers/payments.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();
router.get("/", authMiddleware, requireRole("admin"), ctrl.listPayments);
router.get("/:id", authMiddleware, ctrl.getPayment);
router.patch("/:id/status", authMiddleware, requireRole("admin"), ctrl.updatePaymentStatus);
export default router;
