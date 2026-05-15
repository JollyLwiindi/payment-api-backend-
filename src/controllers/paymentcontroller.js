import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// Generate unique transaction ID
const generateTransactionId = () => {
  return "TXN" + Date.now() + Math.floor(Math.random() * 1000);
};

// Simulate mobile money payment (90% success rate)
const simulateMobileMoneyPayment = (provider, amount) => {
  return new Promise((resolve) => {
    // Simulate network delay (1-2 seconds)
    setTimeout(() => {
      const isSuccess = Math.random() < 0.9; // 90% success rate
      
      if (isSuccess) {
        resolve({
          status: "success",
          message: `Payment of K${amount} via ${provider} successful`,
        });
      } else {
        resolve({
          status: "failed",
          message: `Payment failed. Please try again.`,
        });
      }
    }, 1500);
  });
};

// @desc    Make a payment
// @route   POST /api/payments
// @access  Private (requires login)
export const makePayment = async (req, res) => {
  try {
    const { amount, type, provider, phoneNumber } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    if (!["tithe", "offering", "pta"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type. Use: tithe, offering, or pta",
      });
    }

    if (!["MTN", "Airtel", "Zamtel"].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider. Use: MTN, Airtel, or Zamtel",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Create transaction record (pending)
    const transaction = await Transaction.create({
      userId,
      amount,
      type,
      provider,
      phoneNumber,
      transactionId,
      status: "pending",
    });

    // Simulate payment processing
    const paymentResult = await simulateMobileMoneyPayment(provider, amount);

    // Update transaction status
    transaction.status = paymentResult.status;
    await transaction.save();

    if (paymentResult.status === "success") {
      return res.status(200).json({
        success: true,
        message: paymentResult.message,
        data: {
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          type: transaction.type,
          provider: transaction.provider,
          status: transaction.status,
          date: transaction.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: paymentResult.message,
        data: {
          transactionId: transaction.transactionId,
          status: transaction.status,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my-payments
// @access  Private
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments/admin/all
// @access  Private/Admin
export const getAllPayments = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }
    
    const transactions = await Transaction.find({})
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};