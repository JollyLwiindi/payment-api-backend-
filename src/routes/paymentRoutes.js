import express from "express";
import {
  makePayment,
  getMyPayments,
  getAllPayments,
} from "../controllers/paymentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validatePayment } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Payment endpoints
router.post("/", validatePayment, makePayment);
router.post("/", makePayment);
router.get("/my-payments", getMyPayments);
router.get("/admin/all", adminOnly, getAllPayments);

export default router;