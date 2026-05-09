import { Router } from "express";
import * as ctrl from "../controllers/bookings.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();
router.post("/", ctrl.createBooking);
router.get("/", authMiddleware, requireRole("admin"), ctrl.listBookings);
router.get("/:id", authMiddleware, ctrl.getBooking);
router.patch("/:id/confirm", authMiddleware, requireRole("admin"), ctrl.confirmBooking);
router.patch("/:id/cancel", authMiddleware, ctrl.cancelBooking);
router.delete("/:id", authMiddleware, requireRole("admin"), ctrl.deleteBooking);
export default router;
