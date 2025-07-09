import { Router } from "express";
import {
  getLatestVersion,
  createVersion,
} from "../controllers/appVersion.controller";
import { authenticateFounder } from "../middlewares/auth";

const router = Router();

router.get("/latest", getLatestVersion);
router.post("/create", authenticateFounder, createVersion);

export default router;
