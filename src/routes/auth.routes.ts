// src/routes/auth.routes.ts
import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/auth.controller";
import { authenticateLibrary } from "../middlewares/auth";
import { changePassword } from "../controllers/library.controller";
import { googleLogin } from "../controllers/auth.controller";

const router = Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/library-password", authenticateLibrary, changePassword);

router.post("/google", googleLogin); // POST /api/auth/google

export default router;
