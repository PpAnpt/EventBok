import { Router } from "express";
import * as ctrl from "../controllers/venues.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();
router.get("/", ctrl.listVenues);
router.get("/:id/zones", ctrl.getVenueZones);
router.get("/:id", ctrl.getVenue);
router.post("/", authMiddleware, requireRole("admin"), ctrl.createVenue);
router.put("/:id", authMiddleware, requireRole("admin"), ctrl.updateVenue);
router.delete("/:id", authMiddleware, requireRole("admin"), ctrl.deleteVenue);
export default router;
