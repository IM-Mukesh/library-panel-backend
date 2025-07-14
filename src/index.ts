import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { config } from "./config/env";
import { connectDatabase } from "./config/database";
import { apiRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { generalLimiter } from "./middlewares/rate-limiter";

// 🔌 Socket.IO setup
import { Server as SocketIOServer } from "socket.io";
import { setSocketIO } from "./socket/io";
import { registerSocketHandlers } from "./socket/handlers";

// ───────────────────────────────────────────────────────────────

/**
 * Validate required environment variables
 */
const validateEnv = () => {
  if (!process.env.ALLOWED_ORIGINS) {
    console.warn("⚠️  ALLOWED_ORIGINS not set, using localhost defaults");
  }
};

/**
 * Initialize Express application
 */
const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

/**
 * Configure CORS origins
 */
const getAllowedOrigins = (): string[] => {
  const origins =
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];

  // Fallback for development
  if (origins.length === 0) {
    return config.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://localhost:3001"]
      : [];
  }

  return origins;
};

const allowedOrigins = getAllowedOrigins();

/**
 * Socket.IO initialization with proper error handling
 */
let io: SocketIOServer;
try {
  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      credentials: true,
    },
    // Add connection timeout and other options
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    },
  });

  setSocketIO(io);
  registerSocketHandlers(io);

  // Socket.IO error handling
  io.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error);
  });
} catch (error) {
  console.error("❌ Failed to initialize Socket.IO:", error);
  process.exit(1);
}

/**
 * Security middlewares (applied early)
 */
app.use(helmet());
app.use(cookieParser());

/**
 * CORS configuration
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        return callback(new Error("CORS: No allowed origins configured"));
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

/**
 * Rate limiting (after CORS)
 */
app.use(generalLimiter);

/**
 * Logging
 */
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/**
 * Body parsers
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Main API routes
 */
app.use("/api", apiRoutes);

/**
 * Fallback error handlers
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment
    validateEnv();

    // Connect to database
    await connectDatabase();

    server.listen(config.PORT, () => {
      console.log(
        `🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`
      );
      console.log(`📚 Library Management System API`);
      console.log(
        `🔗 Health check: http://localhost:${config.PORT}/api/health`
      );
      console.log(
        `🔌 Socket.IO enabled with origins: ${allowedOrigins.join(", ")}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`🛑 ${signal} received, shutting down gracefully...`);

  try {
    // Close HTTP server
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Close Socket.IO
    if (io) {
      io.close();
    }

    // Close database connections (if you have a close method)
    // await disconnectDatabase();

    console.log("✅ Server closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Start server
startServer();

export default app;
