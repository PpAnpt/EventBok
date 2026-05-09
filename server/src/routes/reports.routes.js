import { Router } from "express";
import * as ctrl from "../controllers/reports.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();
router.get("/summary", authMiddleware, requireRole("admin"), ctrl.getSummary);
router.get("/revenue", authMiddleware, requireRole("admin"), ctrl.getRevenue);
router.get("/bookings", authMiddleware, requireRole("admin"), ctrl.getBookingStats);
router.get("/top-concerts", authMiddleware, requireRole("admin"), ctrl.getTopConcerts);
export default router;
