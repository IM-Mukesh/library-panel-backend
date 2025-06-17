import type { Response } from "express";
import { validationResult } from "express-validator";
import { Founder } from "../models/Founder";
import { comparePassword } from "../utils/password";
import { generateFounderToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import type { IFounderRequest } from "../types";
import { Types } from "mongoose";
import { config } from "../config/env";
/**
 * Founder login
 * POST /api/founder/login
 */
export const founderLogin = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    // console.log("Inside founder login...");

    const errors = validationResult(req);
    console.log("config is", config.NODE_ENV);

    if (!errors.isEmpty()) {
      const firstErrorMsg = errors.array()[0]?.msg || "Invalid input";
      sendError(res, "Validation failed", 400, firstErrorMsg);
      return;
    }

    const { email, password } = req.body;

    const founder = await Founder.findOne({ email });
    if (!founder) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const isPasswordValid = await comparePassword(
      password,
      founder.passwordHash
    );
    if (!isPasswordValid) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const founderId = founder._id as Types.ObjectId;
    const token = generateFounderToken(founderId.toString(), founder.email);

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax", // or "strict" if your frontend and backend are same-site
      secure: config.NODE_ENV === "production", // Uncomment in production
      // secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, "Login successful", {
      token, // Optional: keep this if frontend expects token in response too
      founder: {
        id: founder._id,
        email: founder.email,
        name: founder.name,
      },
    });
  } catch (error) {
    console.error("Founder login error:", error);
    sendError(res, "Login failed", 500);
  }
};

/**
 * Logout current founder
 * POST /api/founder/logout
 */
export const logoutFounder = (_req: IFounderRequest, res: Response) => {
  console.log("✅ Entered logoutFounder controller");

  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // Use true in production with HTTPS
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("❌ Logout Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

/**
 * Get current founder profile
 * GET /api/founder/me
 */
export const getFounderProfile = async (
  req: IFounderRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.founder!;

    const founder = await Founder.findById(id).select("email name _id");

    if (!founder) {
      sendError(res, "Founder not found", 404);
      return;
    }

    sendSuccess(res, "Founder profile fetched", {
      founder: {
        id: founder._id,
        email: founder.email,
        name: founder.name,
      },
    });
  } catch (error) {
    console.error("Get founder profile error:", error);
    sendError(res, "Something went wrong", 500);
  }
};
