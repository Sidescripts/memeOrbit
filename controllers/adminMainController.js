const {User, Deposit, Withdrawal, Investment} = require("../models")

const getAllUsers = async(req,res) =>{
    // const users = await User.findAll({}).select('-password');
    const users = await User.findAll({});
    return res.status(200).json({success:true, count: users.length, users})
}

const getAllInvestment = async(req,res) =>{
    // const users = await User.findAll({}).select('-password');
    const i = await Investment.findAll({});
    return res.status(200).json({success:true, count: i.length, i})
}


const allDeposit = async(req,res)=>{
    const {trxnId, email} = req.query;
    const queryObject = {};

    if (email) {
        queryObject.email = { $regex: email, $options: 'i' };
    }

    if (trxnId) {
        queryObject.transaction_id = { $regex: transaction_id, $options: 'i' };
    }

    let result = await Deposit.findAll(queryObject);

    const deposit = result;

    return res.status(200).json({success:true, count: deposit.length,deposit});
}

const allWithdrawal = async(req,res) =>{
    const {trxnId,email} = req.query;
    const queryObject ={};
    if(email){
        queryObject.email = {$regex: email, $options: 'i'}
    }

    if(trxnId){
        queryObject.transaction_id = {$regex:transaction_id, $options: 'i'}
    }

    let result = await Withdrawal.findAll(queryObject);
    const withdrawal = result;
    return res.status(200).json({success:true, withdrawal})
}

const approveWithdrawal = async(req,res)=>{
    const {id:withdrawalId} = req.params;
    const withdrawalApprove = await Withdrawal.findOne({where:{id: withdrawalId}});
    if(!withdrawalApprove){
        throw new Error("Withdrawal not found")
    }
    withdrawalApprove.status = "approved";

    await withdrawalApprove.save();

    return res.status(200).json({success:true, withdrawalApprove});
}

const approveDeposit = async(req,res) =>{
    
    const {id:depositId} = req.params; 
    
    const depositAprrove = await Deposit.findOne({where:{id: depositId}});
    if(!depositAprrove){
        throw new Error("No deposit with id "+ depositId);
    } 

    depositAprrove.status = "approved";
    await depositAprrove.save();
    
    return res.status(200).json({success:true, msg: "Deposit successfully approved", depositAprrove})
}

const addDeposit = async (req, res) => {
    try {
        const { id: userId } = req.params;
        const { amount } = req.body;

        const approvedAmount = parseFloat(amount);
        // console.log("Received amount:", approvedAmount);

        // Validate amount
        if (isNaN(approvedAmount) || approvedAmount <= 0) {
            return res.status(400).json({ success: false, msg: "Invalid amount" });
        }

        // Find the user and ensure the latest balance is fetched
        let user = await User.findOne({ where: { id: userId } });

        if (!user) {
            console.error("User not found for ID:", userId);
            return res.status(404).json({ success: false, msg: "No user found" });
        }

        console.log("User found:", user.toJSON());

        // Ensure walletBalance is defined
        if (user.walletBalance == null) {
            console.warn(`User ${userId} has no walletBalance, setting to 0.`);
            user.walletBalance = 0;
        }

        console.log(`Current Wallet Balance: ${user.walletBalance}`);
        console.log(`Adding Approved Amount: ${approvedAmount}`);

        // ✅ Fix: Use Sequelize `.increment()` to properly add the amount
        await user.increment("walletBalance", { by: approvedAmount });

        // Reload user to get updated balance
        await user.reload();

        console.log(`Updated Wallet Balance: ${user.walletBalance}`);

        return res.status(200).json({
            success: true,
            msg: "Deposit successfully made",
            newBalance: user.walletBalance,
        });

    } catch (error) {
        console.error("Error processing deposit:", error);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error",
            error: error.message,
        });
    }
};


module.exports = {
    getAllUsers,
    approveDeposit,
    addDeposit,
    approveWithdrawal,
    allDeposit,
    allWithdrawal,
    getAllInvestment
}