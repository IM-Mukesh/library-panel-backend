import dotenv from "dotenv";

dotenv.config();

interface IConfig {
  PORT: number;
  NODE_ENV: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  BCRYPT_ROUNDS: number;
  S3_REGION: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
}

export const config: IConfig = {
  PORT: Number.parseInt(process.env["PORT"] || "5000", 10),
  NODE_ENV: process.env["NODE_ENV"] || "development",
  MONGO_URI:
    process.env["MONGO_URI"] || "mongodb://localhost:27017/library-management",
  JWT_SECRET: process.env["JWT_SECRET"] || "mukeshvikashlibrary",
  JWT_EXPIRE: process.env["JWT_EXPIRE"] || "7d",
  BCRYPT_ROUNDS: Number.parseInt(process.env["BCRYPT_ROUNDS"] || "12", 10),
  S3_REGION: process.env["S3_REGION"],
  S3_ACCESS_KEY_ID: process.env["S3_ACCESS_KEY_ID"],
  S3_SECRET_ACCESS_KEY: process.env["S3_SECRET_ACCESS_KEY"],
};

// Validate required environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}
