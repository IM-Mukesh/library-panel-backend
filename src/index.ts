import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { connectDatabase } from "./config/database";
import { apiRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { generalLimiter } from "./middlewares/rate-limiter";
import cookieParser from "cookie-parser";
/**
 * Initialize Express application
 */
const app = express();

/**
 * Security middleware
 */
app.use(helmet());
app.use(cookieParser());
const allowedOrigins = process.env["ALLOWED_ORIGINS"]?.split(",") || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

/**
 * Rate limiting
 */
app.use(generalLimiter);

/**
 * Logging middleware
 */
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * API routes
 */
app.use("/api", apiRoutes);

/**
 * Error handling middleware
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(config.PORT, () => {
      console.log(
        `🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
      );
      console.log(`📚 Library Management System API`);
      console.log(
        `🔗 Health check: http://localhost:${config.PORT}/api/health`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start the server
startServer();

export default app;
