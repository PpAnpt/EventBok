import { Router } from "express";
import * as ctrl from "../controllers/concerts.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();

router.get("/", ctrl.listConcerts);
router.get("/:id", ctrl.getConcert);
router.post("/", authMiddleware, requireRole("admin", "organizer"), ctrl.createConcert);
router.put("/:id", authMiddleware, requireRole("admin", "organizer"), ctrl.updateConcert);
router.delete("/:id", authMiddleware, requireRole("admin"), ctrl.deleteConcert);

export default router;
