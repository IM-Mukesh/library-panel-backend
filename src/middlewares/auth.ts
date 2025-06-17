import type { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";
import type {
  IFounderRequest,
  ILibraryRequest,
  IFounderJwtPayload,
  ILibraryJwtPayload,
} from "../types";

/**
 * Middleware to authenticate founder
 */
export const authenticateFounder = (
  req: IFounderRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies["token"]; // ✅ From cookie, not header
    if (!token) {
      sendError(res, "Access token required", 401);
      return;
    }

    const decoded = verifyToken(token) as IFounderJwtPayload;
    if (decoded.role !== "founder") {
      sendError(res, "Invalid token role", 403);
      return;
    }

    // req.founder = decoded;
    console.log("hello brother");

    req.founder = {
      id: decoded["founderId"], // 👈 this fixes the mismatch
      email: decoded.email,
      role: decoded.role,
    };
    console.log("line 40", decoded);

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
