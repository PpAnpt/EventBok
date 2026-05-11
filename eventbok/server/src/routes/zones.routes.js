import { Router } from "express";
import * as ctrl from "../controllers/zones.controller.js";

const router = Router();
router.get("/", ctrl.listZones);
router.get("/:id", ctrl.getZone);
export default router;
