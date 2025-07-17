import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config/env";
import type { IFounderJwtPayload, ILibraryJwtPayload } from "../types";
import type ms from "ms";
const JWT_SECRET = config.JWT_SECRET || "default_jwt_secret";
const JWT_EXPIRE = (config.JWT_EXPIRE || "7d") as ms.StringValue;

/**
 * Generate JWT token for founder
 */
export const generateFounderToken = (
  founderId: string,
  email: string
): string => {
  const payload: Omit<IFounderJwtPayload, "iat" | "exp"> = {
    founderId,
    email,
    role: "founder",
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRE,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate JWT token for library admin
 */
export const generateLibraryToken = (
  libraryId: string,
  adminEmail: string
): string => {
  const payload: Omit<ILibraryJwtPayload, "iat" | "exp"> = {
    libraryId,
    adminEmail,
    role: "library_admin",
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRE,
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify JWT token
 */
export const verifyToken = (
  token: string
): IFounderJwtPayload | ILibraryJwtPayload => {
  return jwt.verify(token, JWT_SECRET) as
    | IFounderJwtPayload
    | ILibraryJwtPayload;
};

export const generateSalonToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

// export const verifyToken = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers["authorization"];

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({
//       success: false,
//       message: "Missing or invalid Authorization header",
//     });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as
//       | IFounderJwtPayload
//       | ILibraryJwtPayload;

//     if ("libraryId" in decoded) {
//       req.libraryId = decoded.libraryId; // ✅ Now recognized by TypeScript
//     }

//     next();
//   } catch (err) {
//     console.error("JWT ERROR:", err);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }
// };
