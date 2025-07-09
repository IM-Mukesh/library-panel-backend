import express from "express";
import * as studentCtrl from "../controllers/student.controller";
// import { verifyToken } from "../utils/jwt";
import { authenticateLibrary } from "../middlewares/auth";

const router = express.Router();

// router.use(verifyToken); // protect all student routes

router.use(authenticateLibrary);

router.post("/", studentCtrl.createStudent);
router.get("/", studentCtrl.getAllStudentByAdmin);

router.get("/due", studentCtrl.getDueFees);
router.get("/recentpaid", studentCtrl.getRecentPayments);

router.get("/:id", studentCtrl.getStudent);
router.put("/:id", studentCtrl.updateStudent);
router.delete("/:id", studentCtrl.deleteStudent);
export { router as studentRoutes };
