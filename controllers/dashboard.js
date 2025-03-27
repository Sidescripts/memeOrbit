const { User } = require("../models");
const { Withdrawal } = require("../models");
const { Investment } = require("../models");
const { Deposit } = require("../models");

/**
 * Fetch and update user dashboard data.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - Dashboard data with updated totals.
 */
const getAndUpdateDashboard = async (req, res) => {
  const { userId } = req.user; // Extract userId from request parameters1
  try {
    // Fetch user data
    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "walletBalance", "totalInvestment", "totalWithdrawal", "totalDeposit"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate dynamic totals
    const totalInvestment = await Investment.sum("amount", {
      where: { userId },
    }) || 0.0;

    const totalWithdrawal = await Withdrawal.sum("amount", {
      where: { userId },
    }) || 0.0;

    const totalDeposit = await Deposit.sum("amount", {
      where: { userId },
    }) || 0.0;

    // Fetch the most recent ongoing investment
    const currentInvestment = await Investment.findOne({
      where: { userId, status: "ongoing" },
      order: [["createdAt", "DESC"]],
      attributes: ["amount"],
    });
    console.log(currentInvestment)
    // Update the user model with calculated totals
    user.totalInvestment = totalInvestment;
    user.totalWithdrawal = totalWithdrawal;
    user.totalDeposit = totalDeposit;
    await user.save(); // Persist changes to the database

    // Return the updated dashboard data
    return res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: {
        username: user.username,
        walletBalance: user.walletBalance || 0.00,
        totalInvestment: user.totalInvestment || 0.00,
        totalWithdrawal: user.totalWithdrawal || 0.00,
        totalDeposit: user.totalDeposit || 0.00,
        currentInvestment: currentInvestment || 0.00,
      },
    });
  } catch (error) {
    console.error("Error fetching or updating dashboard:", error.message);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

async function testDashB(req,res){
  console.log("test dashboard working")
  console.log(req.user.userId)

  return res.json({
    msg: "It might just be working or not"
  });
}

module.exports = { getAndUpdateDashboard, testDashB };