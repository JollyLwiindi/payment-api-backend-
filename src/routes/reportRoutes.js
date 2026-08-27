import express from "express";
import {
  getReports,
  getMonthlyReport,
  getDashboardSummary,
} from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// All report routes require authentication and admin access
router.use(protect);
router.use(adminOnly);

// Report endpoints
router.get("/", getReports);
router.get("/monthly", getMonthlyReport);
router.get("/dashboard", getDashboardSummary);

export default router;