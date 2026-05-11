import { Router } from "express";
import * as ctrl from "../controllers/customers.controller.js";
import { authMiddleware, requireRole } from "../utils/auth.middleware.js";

const router = Router();
router.post("/login", ctrl.loginCustomer);
router.get("/me/bookings", authMiddleware, requireRole("customer"), ctrl.getMyBookings);
router.get("/", authMiddleware, requireRole("admin"), ctrl.listCustomers);
router.get("/:id", authMiddleware, ctrl.getCustomer);
export default router;
