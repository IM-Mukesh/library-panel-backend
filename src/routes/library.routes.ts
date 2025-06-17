import { Router } from "express";
import {
  getLibraries,
  createLibrary,
  getLibrary,
  blockLibrary,
  unblockLibrary,
  markLibraryPaid,
  libraryLogin,
} from "../controllers/library.controller";
import { authenticateFounder } from "../middlewares/auth";
import {
  validateLibraryCreation,
  validateLibraryFilters,
  validateObjectId,
  validatePaymentNotes,
  validateLibraryLogin,
} from "../middlewares/validation";
import { updateLibrary } from "../controllers/library.controller";
import { authLimiter } from "../middlewares/rate-limiter";
import {
  getDashboardStats,
  getRecentActivities,
} from "../controllers/library.controller";

// 👇 Add after other founder-protected routes

const router = Router();

// Founder routes (protected)
router.get("/", authenticateFounder, validateLibraryFilters, getLibraries);
router.post("/", authenticateFounder, validateLibraryCreation, createLibrary);
router.get("/:id", authenticateFounder, validateObjectId, getLibrary);

router.patch("/:id", authenticateFounder, validateObjectId, updateLibrary);

router.patch("/:id/block", authenticateFounder, validateObjectId, blockLibrary);
router.patch(
  "/:id/unblock",
  authenticateFounder,
  validateObjectId,
  unblockLibrary
);
router.patch(
  "/:id/mark-paid",
  authenticateFounder,
  validateObjectId,
  validatePaymentNotes,
  markLibraryPaid
);
router.get("/dashboard/stats", authenticateFounder, getDashboardStats);
router.get("/dashboard/recent", authenticateFounder, getRecentActivities);

// Library admin routes
router.post("/login", authLimiter, validateLibraryLogin, libraryLogin);

// Protected library admin routes (with access control)
// Add more library admin specific routes here as needed
// Example: router.get('/dashboard', authenticateLibrary, checkLibraryAccess, getDashboard);

export { router as libraryRoutes };
