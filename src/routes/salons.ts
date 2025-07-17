import express from "express";
import {
  getSalonById,
  createSalon,
  getNearbySalons,
  getAllSalons,
  getSalonProfile,
  updateSalonProfile,
  addSalonImage,
  getUploadUrl,
} from "../controllers/salons.controller";
import { protect } from "../middlewares/auth";
import { verifyToken } from "../utils/jwt";

const router = express.Router();

// Specific routes FIRST
router.get("/all", getAllSalons);
router.post("/nearby", getNearbySalons);
router.post("/create", createSalon);

router.get("/me", protect, getSalonProfile); // must be before "/:id"
router.put("/update", protect, updateSalonProfile); // must be before "/:id"
router.post("/images", protect, addSalonImage); // must be before "/:id"
router.get("/upload-url", protect, getUploadUrl); // must be before "/:id"

// Dynamic ID route LAST
router.get("/:id", getSalonById);

export default router;
