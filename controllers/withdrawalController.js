const {
    findAllWithdrawalForUser,
    findWithdrawalById,
    createWithdrawal
} = require("../service/withdrawalServices");
const {findUserById} = require("../service/userService");
const {findMostRecentInvestment, findMostRecentCompletedInvestment} = require("../service/investmentService");
const axios = require("axios");
const sendWithdrawalEmail = require("../utils/wthEmail");

const getConversionRate = async (method) => {
    let apiEndpoint;

    // Define API endpoints for each currency
    switch (method) {
        case "btc":
            apiEndpoint = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"; // Replace with a BTC-to-USD API if needed
            break;
        case "usdt":
            apiEndpoint = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd"; // Replace with an appropriate USDT-to-USD API
            break;
        default:
            throw new Error("Invalid deposit method");
    }

    // Fetch conversion rate
    const response = await axios.get(apiEndpoint);

    // Extract conversion rate based on API response structure
    let conversionRate;
    if (method === "btc") {
        conversionRate = response.data.bitcoin.usd; // Adjust based on the API's BTC response structure
    } else if (method === "usdt") {
        conversionRate = 1; // USDT is pegged to USD
    }

    return parseFloat(conversionRate);
};

// request withdrawal
async function requestWithdrawal(req, res) {
  const userId = req.user.userId;
  const { amount, method, walletAdd } = req.body;
    
  try {
    if (!amount || !method || !walletAdd) {
      return res.status(400).json({ error: "Please provide all required fields: amount, method, and wallet address." });
    }

    // let user = await User.findOne({ where: { id: userId } });
    const user = await findUserById({ userId });
    
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const recentInvestment = await findMostRecentCompletedInvestment({ userId });
    
    if (!recentInvestment) {
      return res.status(400).json({ error: "No recent investment found." });
    }

    if (!["btc", "usdt"].includes(method)) {
      return res.status(400).json({ error: "Invalid withdrawal method. Choose 'btc' or 'usdt'." });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount." });
    }

    // Get conversion rate to USDT
    const conversionRate = await getConversionRate(method);
    const usdtEquivalent = numericAmount * conversionRate;

    if (usdtEquivalent > user.walletBalance) {
      return res.status(400).json({
        error: "Insufficient wallet balance for the equivalent USDT amount.",
      });
    }

    const plan = recentInvestment.plan?.toLowerCase(); // handle case sensitivity
    const maxWithdrawalLimits = {
      "basic plan": 100,
      "moon plan": 500,
      "boom plan": Infinity,
    };

    const planLimit = maxWithdrawalLimits[plan] ?? 0;

    if (usdtEquivalent > planLimit) {
      const nextPlan = plan === "basic plan" ? "moon plan" : "boom plan";
      return res.status(400).json({
        error: `Upgrade to the ${nextPlan} to process this withdrawal amount.`,
      });
    }

    // Deduct from wallet
    user.walletBalance -= usdtEquivalent;
    await user.save();

    const trxnId = `WD-${Date.now()}`;
    const withdrawal = await createWithdrawal({
      userId,
      amount: numericAmount,
      trxnId,
      method,
      euEquAmount: usdtEquivalent,
      walletAdd,
      status: "pending",
    });

    await sendWithdrawalEmail({
      email: user.email,
      username: user.username,
      method,
      amount: numericAmount,
      status: "Pending",
    });

    return res.status(200).json({
      message: "Withdrawal request submitted successfully.",
      withdrawal,
    });

  } catch (error) {
    console.error("Withdrawal request error:", error);
    return res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  }
}


// withdrawal history
async function withdrawalHistory(req,res) {
    try {
        const userId = req.user.id;
        const withdrawals = findAllWithdrawalForUser({userId});

        if(!withdrawals || withdrawals.length === 0){
            return res.status(404).jdon({msg: "No Withdrawal History Found"})
        }
        res.status(200).json({withdrawals});
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

// withdrawal receipt
async function withdrawalReciept(req, res) {
    try {
        const {withdrawalId} = req.params;
        const withdrawal = await findWithdrawalById({id:withdrawalId});

        if(!withdrawal){
            return res.status(404).json({msg: `No withdrawal history with the id `})
        }

        res.status(200).json({withdrawal})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    requestWithdrawal,
    withdrawalHistory,
    withdrawalReciept
}