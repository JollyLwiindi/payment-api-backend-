import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(cors());

// ========== RATE LIMITING ==========
// Limit payment requests to prevent spam
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // CHANGE TO 1 MINUTE for testing
  max: 10,
  message: {
    success: false,
    message: "Too many payment attempts. Please try again later."
  }
});

// Apply rate limiting to payment routes
app.use("/api/payments", paymentLimiter);

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

// ========== TEST ROUTE ==========
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;