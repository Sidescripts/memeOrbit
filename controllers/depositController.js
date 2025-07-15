const {
    createdeposit,
    findAllDepositForUser,
    findDepositById
} = require("../service/depositServic");
const { findUserById } = require("../service/userService");
const sendDepositEmail = require("../utils/depositEmamil");
const axios = require("axios");

const getConversionRate = async (method) => {
    let apiEndpoint;

    // Define API endpoints for each currency
    switch (method) {
        case "btc":
            apiEndpoint = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"; // Replace with a BTC-to-USD API if needed
            break;
        case "eth":
            apiEndpoint = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"; // Replace with an appropriate ETH-to-USD API
            break;
        case "usdt":
            apiEndpoint = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd"; // Replace with an appropriate USDT-to-USD API
            break;
        default:
            throw new Error("Invalid deposit method!");
    }

    // Fetch conversion rate
    const response = await axios.get(apiEndpoint);

    // Extract conversion rate based on API response structure
    let conversionRate;
    if (method === "btc") {
        conversionRate = response.data.bitcoin.usd; // Adjust based on the API's BTC response structure
    } else if (method === "eth") {
        conversionRate = response.data.ethereum.usd; // Adjust based on the API's ETH response structure
    } else if (method === "usdt") {
        conversionRate = response.data.tether.usd; // USDT is pegged to USD
        conversionRate = 1;
    }

    return parseFloat(conversionRate);
};

const fundWallet = async (req, res) => {
    const { method, amount } = req.body;
    const {userId} = req.user;
//    console.log(method)

    try {
        const user = await findUserById({userId});
        if(!user){
            throw new Error("User not found");
            // return res.status(404).json({error: " User not found!"})
        }

        // Validate method and amount
        if (!["btc", "eth", "usdt"].includes(method)) {
            throw new Error("Invalid deposit method")
            // return res.status(400).json({ error: "Invalid deposit method" });
        }

        if (!amount || isNaN(amount)) {
            throw new Error("Invalid amount")
            // return res.status(400).json({ error: "Invalid amount" });
        }

        // Get the conversion rate
        const conversionRate = await getConversionRate(method);

        // Convert the deposit amount to USDT
        const usdtEquivalentAmount = parseFloat(amount) * conversionRate;

        // Ensure the minimum deposit equivalent in USDT
        if (usdtEquivalentAmount < 300) {
            throw new Error("Minimum deposit is $300")
            // return res.status(400).json({ error: "Minimum deposit is 300 USDT" });
        }

        const trxnId = `DP-${Date.now()}`;
        const deposit = await createdeposit({
            userId, 
            method, 
            status:"pending", 
            amount, 
            euEquAmount:usdtEquivalentAmount, 
            trxnId
        });

        await sendDepositEmail({
            email: user.email,
            username: user.username,
            method: method,
            amount: amount,
        });

        // If the deposit is valid
        return res.status(200).json({
            message: "Deposit successful",
            convertedAmount: usdtEquivalentAmount.toFixed(2),
            data: deposit,
        });

    } catch (error) {
        console.log("Error handling deposit:", error);
        return res.status(500).json({ error: "An error occurred while processing the deposit" });
    }
};


// deposit history
async function getAllDeposit(req,res) {
    try {
        const {userId} = req.user;
        console.log(userId)
    
        const deposit = await findAllDepositForUser({userId});

        if(!deposit || deposit.length === 0){
            console.log(deposit)
            return res.status(404).json({msg: "No deposit found"})
        }
        console.log(deposit)
        res.status(200).json({deposit});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
}

// deposit receipt
async function getOneDeposit(req,res) {
    try {
        const {depositId} = req.params;
        const deposit =  await findDepositById({id: depositId});
        if(!deposit){
            return res.status(404).json({error: "No deposit history found"})
        }
        res.status(200).json({deposit})
    } catch (error) {
         console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    fundWallet,
    getAllDeposit,
    getOneDeposit
}