import { Router } from "express";
import * as ctrl from "../controllers/seatmaps.controller.js";

const router = Router();
router.get("/", ctrl.listSeatmaps);
router.get("/:id", ctrl.getSeatmap);
export default router;
