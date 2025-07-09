import { Router } from "express";
import { founderRoutes } from "./founder.routes";
import { libraryRoutes } from "./library.routes";
import { studentRoutes } from "./student.routes";
import paymentRoutes from "./payment.routes";
import authRoutes from "./auth.routes";
import appVersionRoutes from "./appVersion.routes";
const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Route handlers
router.use("/founder", founderRoutes);
router.use("/libraries", libraryRoutes);
router.use("/library", libraryRoutes); // For library-specific endpoints
router.use("/student", studentRoutes);
router.use("/payments", paymentRoutes);
router.use("/auth", authRoutes);
router.use("/version", appVersionRoutes);

export { router as apiRoutes };
