import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response";
// const isProd = process.env["NODE_ENV"] === "production";
/**
 * General rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, "Too many requests, please try again later", 429);
  },
});

/**
 * Auth rate limiter (stricter for login endpoints)
 */
// export const authLimiter = rateLimit({
//   windowMs: isProd ? 15 * 60 * 1000 : 1 * 60 * 1000, // 15 mins in prod, 1 min in dev
//   max: isProd ? 5 : 100, // 5 attempts in prod, 100 in dev
//   message: "Too many login attempts, please try again later",
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (_req, res) => {
//     sendError(res, "Too many login attempts, please try again later", 429);
//   },
// });

// authLimiter.ts (or wherever it's used)
export const authLimiter = (_req: any, _res: any, next: any) => next();
