import { Router } from "express";
import { founderLogin, logoutFounder } from "../controllers/founder.controller";
import { validateFounderLogin } from "../middlewares/validation";
import { authLimiter } from "../middlewares/rate-limiter";
import { getFounderProfile } from "../controllers/founder.controller";
import { authenticateFounder } from "../middlewares/auth";
const router = Router();

// POST /api/founder/login
router.post("/login", authLimiter, validateFounderLogin, founderLogin);

// GET /api/founder/me
router.get("/me", authenticateFounder, getFounderProfile);

// routes/founder.ts
router.post("/logout", authenticateFounder, logoutFounder);

export { router as founderRoutes };
