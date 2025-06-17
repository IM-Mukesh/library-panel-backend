import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((val: any) => val.message)
      .join(", ");
    sendError(res, "Validation Error", 400, message);
    return;
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    sendError(res, `${field} already exists`, 400);
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    sendError(res, "Invalid token", 401);
    return;
  }

  if (error.name === "TokenExpiredError") {
    sendError(res, "Token expired", 401);
    return;
  }

  // Default error
  sendError(res, "Internal server error", 500);
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
