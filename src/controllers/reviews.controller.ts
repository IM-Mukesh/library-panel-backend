import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/review.model";
import Salon from "../models/salon.model";

// POST /api/reviews/:salonId
export const addReview = async (req: Request, res: Response) => {
  const { salonId } = req.params;
  const { username, rating, comment } = req.body;

  // Validate salon ID
  if (!mongoose.Types.ObjectId.isValid(salonId)) {
    return res.status(400).json({ error: "Invalid salon ID" });
  }

  // Validate inputs
  if (!username || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Missing or invalid review data" });
  }

  try {
    // Ensure salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ error: "Salon not found" });
    }

    // Optional: Prevent duplicate reviews by same name
    const existingReview = await Review.findOne({
      salon: salonId,
      username,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this salon." });
    }

    // Create and save the review
    const review = new Review({
      salon: salonId,
      username,
      rating,
      comment,
    });

    await review.save();

    return res
      .status(201)
      .json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/reviews/:salonId
export const getReviewsBySalon = async (req: Request, res: Response) => {
  const { salonId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(salonId)) {
    return res.status(400).json({ error: "Invalid salon ID" });
  }

  try {
    const reviews = await Review.find({ salon: salonId }).sort({
      createdAt: -1,
    });

    res.json({ count: reviews.length, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
