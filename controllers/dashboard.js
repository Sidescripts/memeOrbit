
/**
 * Fetch and update user dashboard data.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - Dashboard data with updated totals.
 */
const { User, Withdrawal, Investment, Deposit } = require("../models");

const getTotalApprovedDepositInUSD = (userId) => {
  return Deposit.sum('euEquAmount', {
    where: {
      userId,
      status: 'approved',
    },
  });
};

const getAndUpdateDashboard = async (req, res) => {
  const { userId } = req.user;

  try {
    // Fetch user and totals simultaneously
    const [user, totalInvestment, totalWithdrawal, totalDeposit, currentInvestment] = await Promise.all([
      User.findByPk(userId, {
        attributes: ["id", "username", "walletBalance", "totalInvestment", "totalWithdrawal", "totalDeposit"],
      }),
      Investment.sum("amount", { where: { userId, status: 'completed' } }),
      Withdrawal.sum("amount", { where: { userId, status: 'approved' } }),
      getTotalApprovedDepositInUSD(userId),
      Investment.findOne({
        where: { userId, status: "ongoing" },
        order: [["createdAt", "DESC"]],
        attributes: ["amount"],
      }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Default to 0 if null
    user.totalInvestment = totalInvestment || 0.0;
    user.totalWithdrawal = totalWithdrawal || 0.0;
    user.totalDeposit = totalDeposit || 0.0;

    await user.save(); // Save updated fields

    return res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: {
        username: user.username,
        walletBalance: user.walletBalance || 0.00,
        totalInvestment: user.totalInvestment,
        totalWithdrawal: user.totalWithdrawal,
        totalDeposit: user.totalDeposit,
        currentInvestment: currentInvestment || null,
      },
    });
    
  } catch (error) {
    console.error("Error fetching or updating dashboard:", error);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

module.exports = { getAndUpdateDashboard };
