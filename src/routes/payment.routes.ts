import express from "express";
import {
  createPayment,
  getStudentPayments,
  updatePayment,
  deletePayment,
  getAllPayments,
} from "../controllers/paymentController";

const router = express.Router();

router.post("/", createPayment); // POST /api/payments
router.get("/student/:id", getStudentPayments); // GET  /api/payments/student/:id
router.put("/:id", updatePayment); // PUT  /api/payments/:id
router.delete("/:id", deletePayment); // DELETE /api/payments/:id
router.get("/", getAllPayments); // GET  /api/payments?from=...&to=...

export default router;
