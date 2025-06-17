import dotenv from "dotenv";

dotenv.config();

interface IConfig {
  PORT: number;
  NODE_ENV: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  BCRYPT_ROUNDS: number;
}

export const config: IConfig = {
  PORT: Number.parseInt(process.env["PORT"] || "5000", 10),
  NODE_ENV: process.env["NODE_ENV"] || "development",
  MONGO_URI:
    process.env["MONGO_URI"] || "mongodb://localhost:27017/library-management",
  JWT_SECRET: process.env["JWT_SECRET"] || "mukeshvikashlibrary",
  JWT_EXPIRE: process.env["JWT_EXPIRE"] || "7d",
  BCRYPT_ROUNDS: Number.parseInt(process.env["BCRYPT_ROUNDS"] || "12", 10),
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
