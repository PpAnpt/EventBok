import { Router } from "express";
import * as ctrl from "../controllers/sessions.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();
router.get("/", ctrl.listSessions);
router.post("/", authMiddleware, requireRole("admin", "organizer"), ctrl.createSession);
router.put("/:id", authMiddleware, requireRole("admin", "organizer"), ctrl.updateSession);
router.delete("/:id", authMiddleware, requireRole("admin", "organizer"), ctrl.deleteSession);
export default router;
