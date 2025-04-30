const { User, Withdrawal, Investment, Deposit } = require("../models");

/**
 * Fetch the total USD equivalent of approved deposits for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} - The total approved deposit in USD.
 */
async function getTotalDepositInUSD(userId) {
  try {
    console.log(`Fetching total approved deposits in USD for user: ${userId}`);

    const totalDepositUSD = await Deposit.sum('euEquAmount', {
      where: {
        userId,
        status: 'approved', // Only deposits with status "approved"
      },
    });

    console.log("Total approved USD deposits:", totalDepositUSD ?? 0);

    return totalDepositUSD || 0; // Fallback to 0 if result is null
  } catch (error) {
    console.error("Error fetching total deposit in USD:", error);
    throw new Error("Could not fetch total deposit in USD");
  }
}

/**
 * Fetch user dashboard data.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The dashboard data.
 */
const getDashboardData = async (userId) => {
  try {
    // Fetch user data
    const user = await User.findByPk(userId, {
      attributes: ["username", "walletBalance"],
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch and sum total investments
    const totalInvestment = await Investment.sum("amount", {
      where: { userId },
    });

    // Fetch and sum total withdrawals
    const totalWithdrawal = await Withdrawal.sum("amount", {
      where: { userId },
    });

    // Fetch and sum total deposits (only approved deposits' euEquAmount)
    const totalDeposit = await getTotalDepositInUSD(userId);

    // Fetch the most recent ongoing investment
    const currentInvestment = await Investment.findOne({
      where: { userId, status: "ongoing" },
      order: [["createdAt", "DESC"]],
      attributes: ["amount", "plan", "createdAt"],
    });

    // Return structured dashboard data
    return {
      username: user.username,
      walletBalance: user.walletBalance,
      totalInvestment: totalInvestment || 0.0,
      totalWithdrawal: totalWithdrawal || 0.0,
      totalDeposit: totalDeposit || 0.0,
      currentInvestment: currentInvestment || null,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    throw error;
  }
};

module.exports = { getDashboardData };
