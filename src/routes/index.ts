import { Router } from "express";
import { founderRoutes } from "./founder.routes";
import { libraryRoutes } from "./library.routes";

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

export { router as apiRoutes };
