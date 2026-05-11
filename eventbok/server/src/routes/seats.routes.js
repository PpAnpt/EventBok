import { Router } from "express";
import * as ctrl from "../controllers/seats.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();
router.get("/", ctrl.listSeats);
router.patch("/:id/status", authMiddleware, requireRole("admin"), ctrl.updateSeatStatus);
export default router;
