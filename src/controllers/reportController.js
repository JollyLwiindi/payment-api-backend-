import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// @desc    Get reports with filters (date range, type, provider)
// @route   GET /api/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, type, provider, status } = req.query;

    // Build filter object
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Payment type filter
    if (type && type !== "all") {
      filter.type = type;
    }

    // Provider filter
    if (provider && provider !== "all") {
      filter.provider = provider;
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Get transactions with filters
    const transactions = await Transaction.find(filter)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    // Calculate summary statistics
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const successfulCount = transactions.filter(t => t.status === "success").length;
    const failedCount = transactions.filter(t => t.status === "failed").length;
    const pendingCount = transactions.filter(t => t.status === "pending").length;

    // Group by type
    const byType = {};
    transactions.forEach(t => {
      if (!byType[t.type]) byType[t.type] = { count: 0, total: 0 };
      byType[t.type].count++;
      byType[t.type].total += t.amount;
    });

    // Group by provider
    const byProvider = {};
    transactions.forEach(t => {
      if (!byProvider[t.provider]) byProvider[t.provider] = { count: 0, total: 0 };
      byProvider[t.provider].count++;
      byProvider[t.provider].total += t.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        summary: {
          totalTransactions: transactions.length,
          totalAmount: totalAmount,
          successfulCount,
          failedCount,
          pendingCount,
          byType,
          byProvider,
        },
        filters: {
          startDate: startDate || null,
          endDate: endDate || null,
          type: type || "all",
          provider: provider || "all",
          status: status || "all",
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get monthly summary report
// @route   GET /api/reports/monthly
// @access  Private/Admin
export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Use current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Build date range for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate("userId", "name email phone");

    // Calculate daily totals
    const dailyTotals = {};
    for (let day = 1; day <= endDate.getDate(); day++) {
      const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dailyTotals[dateStr] = 0;
    }

    let totalAmount = 0;
    let titheTotal = 0;
    let offeringTotal = 0;
    let ptaTotal = 0;

    transactions.forEach(t => {
      const dateStr = t.createdAt.toISOString().split('T')[0];
      if (dailyTotals[dateStr] !== undefined) {
        dailyTotals[dateStr] += t.amount;
      }
      totalAmount += t.amount;
      if (t.type === "tithe") titheTotal += t.amount;
      else if (t.type === "offering") offeringTotal += t.amount;
      else if (t.type === "pta") ptaTotal += t.amount;
    });

    // Convert daily totals to array for charts
    const dailyData = Object.keys(dailyTotals).map(date => ({
      date,
      amount: dailyTotals[date],
    }));

    res.status(200).json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        totalTransactions: transactions.length,
        totalAmount,
        titheTotal,
        offeringTotal,
        ptaTotal,
        dailyData,
        transactions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get summary dashboard (for admin dashboard)
// @route   GET /api/reports/dashboard
// @access  Private/Admin
export const getDashboardSummary = async (req, res) => {
  try {
    // Get all transactions
    const allTransactions = await Transaction.find({});
    const totalTransactions = allTransactions.length;

    // Total amount
    const totalAmount = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Success/failed counts
    const successful = allTransactions.filter(t => t.status === "success").length;
    const failed = allTransactions.filter(t => t.status === "failed").length;

    // Count by type
    const titheCount = allTransactions.filter(t => t.type === "tithe").length;
    const offeringCount = allTransactions.filter(t => t.type === "offering").length;
    const ptaCount = allTransactions.filter(t => t.type === "pta").length;

    // Count by provider
    const mtnCount = allTransactions.filter(t => t.provider === "MTN").length;
    const airtelCount = allTransactions.filter(t => t.provider === "Airtel").length;
    const zamtelCount = allTransactions.filter(t => t.provider === "Zamtel").length;

    // Get last 10 transactions
    const recentTransactions = await Transaction.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get unique users count
    const uniqueUsers = await Transaction.distinct("userId");
    const totalUsers = uniqueUsers.length;

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        totalAmount,
        successful,
        failed,
        byType: { tithe: titheCount, offering: offeringCount, pta: ptaCount },
        byProvider: { MTN: mtnCount, Airtel: airtelCount, Zamtel: zamtelCount },
        totalUsers,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};