import { Router } from "express";
import jwt from "jsonwebtoken";
import { sendOne, sendError } from "../utils/response.js";

const router = Router();

// POST /api/auth/login  (Demo: any email+password works)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return sendError(res, "Email and password required", 400);

  // Demo mode: accept any credentials as admin
  const token = jwt.sign(
    { email, role: "admin", name: "Admin User" },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "24h" }
  );
  sendOne(res, { token, user: { email, role: "admin", name: "Admin User" } });
});

router.post("/logout", (_, res) => sendOne(res, { message: "Logged out" }));

export default router;
