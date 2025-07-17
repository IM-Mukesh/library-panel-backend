import express from "express";
import {
  addReview,
  getReviewsBySalon,
} from "../controllers/reviews.controller";

const router = express.Router();

router.post("/:salonId", addReview);
router.get("/:salonId", getReviewsBySalon);

export default router;
