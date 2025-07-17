import type { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import type {
  IFounderRequest,
  ILibraryRequest,
  IFounderJwtPayload,
  ILibraryJwtPayload,
} from "../types";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
/**
 * Middleware to authenticate founder
 */
export const authenticateFounder = (
  req: IFounderRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token = req.cookies["token"];
    if (!token) {
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      sendError(res, "Access token requireds", 401);
      return;
    }

    const decoded = verifyToken(token) as IFounderJwtPayload;
    if (decoded.role !== "founder") {
      sendError(res, "Invalid token role", 403);
      return;
    }

    req.founder = {
      id: decoded["founderId"], // 👈 this fixes the mismatch
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("❌ Token error:", error);
    sendError(res, "Invalid or expired token", 401);
  }
};

/**
 * Middleware to authenticate library admin
 */
export const authenticateLibrary = (
  req: ILibraryRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Access token required", 401);
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token) as ILibraryJwtPayload;

    if (decoded.role !== "library_admin") {
      sendError(res, "Invalid token role", 403);
      return;
    }

    req.library = decoded;

    next();
  } catch (error) {
    sendError(res, "Invalid or expired token", 401);
  }
};

export const protect = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const authHeader =
      req.headers.authorization || req.headers.get?.("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId); // ✅ Corrected

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  }
);
