import { authenticateFounder } from "../middlewares/auth";
import {
  validateLibraryCreation,
  validateLibraryFilters,
  validateObjectId,
  validatePaymentNotes,
  validateLibraryLogin,
} from "../middlewares/validation";
import { Router } from "express";
import { updateLibrary } from "../controllers/library.controller";
import { authLimiter } from "../middlewares/rate-limiter";
import {
  getDashboardStats,
  getRecentActivities,
} from "../controllers/library.controller";

// 👇 Add after other founder-protected routes

const router = Router();

router.get("/dashboard/stats", authenticateFounder, getDashboardStats);
router.get("/dashboard/recent", authenticateFounder, getRecentActivities);

// Protected library admin routes (with access control)
// Add more library admin specific routes here as needed
// Example: router.get('/dashboard', authenticateLibrary, checkLibraryAccess, getDashboard);

export { router as dashboardRoutes };
