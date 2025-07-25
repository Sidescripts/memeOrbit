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

async function getUserDetails(req, res){
    try {
        const {
            email,
            dAmt,
            iAmt,
            wAmt,
            wBal
        } = req.body;
        if(!email) {
            throw new Error("Input a valid email")
        }
        const userDetails = await User.findOne({where: {email: email}});
        if(!userDetails){
            throw new Error("User details not found!")
        }

        if(!dAmt||!iAmt||!wAmt||!wBal){
            throw new Error("Fields are required")
        }

        const {
            totalDeposit,
            totalInvestment,
            totalWithdrawal,
            walletBalance
        } = userDetails;

        totalDeposit += dAmt
        totalInvestment += iAmt
        totalWithdrawal += wAmt
        walletBalance += wBal

        await userDetails.save();

        return res.status(200).json({ msg: "success", 
            totalDeposit: userDetails.totalDeposit,
            totalInvestment: userDetails.totalInvestment,
            totalWithdrawal: userDetails.totalWithdrawal,
            walletBalance: userDetails.walletBalance
        });
    } catch (error) {
        console.log(error)
    }
}

const updateUserFinancials = async (req, res) => {
    const { email, ...updates } = req.body;
    
    try {
        // 1. Find the user
        const user = await User.findOne({ 
            where: { 
                email: email
                
            }
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        console.log("Original user data:", {
            totalDeposit: user.totalDeposit,
            totalInvestment: user.totalInvestment,
            totalWithdrawal: user.totalWithdrawal,
            walletBalance: user.walletBalance
        });

        // 2. Prepare updates
        const fieldsToUpdate = {};
        let changesMade = false;

        if (updates.dAmt !== undefined) {
            fieldsToUpdate.totalDeposit = parseFloat(user.totalDeposit) + parseFloat(updates.dAmt);
            changesMade = true;
        }

        if (updates.iAmt !== undefined) {
            fieldsToUpdate.totalInvestment = parseFloat(user.totalInvestment) + parseFloat(updates.iAmt);
            changesMade = true;
        }

        if (updates.wAmt !== undefined) {
            fieldsToUpdate.totalWithdrawal = parseFloat(user.totalWithdrawal) + parseFloat(updates.wAmt);
            changesMade = true;
        }

        if (updates.wBal !== undefined) {
            fieldsToUpdate.walletBalance = parseFloat(user.walletBalance) + parseFloat(updates.wBal);
            changesMade = true;
        }

        if (!changesMade) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update"
            });
        }

        // 3. Apply updates
        Object.assign(user, fieldsToUpdate);

        // 4. Save changes
        await user.save();

        console.log("Updated user data:", {
            totalDeposit: user.totalDeposit,
            totalInvestment: user.totalInvestment,
            totalWithdrawal: user.totalWithdrawal,
            walletBalance: user.walletBalance
        });

        // 5. Return updated data
        res.json({
            success: true,
            message: "User financials updated successfully",
            data: {
                email: user.email,
                totalDeposit: user.totalDeposit,
                totalInvestment: user.totalInvestment,
                totalWithdrawal: user.totalWithdrawal,
                walletBalance: user.walletBalance,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error("Detailed error:", {
            message: error.message,
            stack: error.stack,
            raw: error
        });
        
        res.status(500).json({
            success: false,
            message: "Failed to update user financials",
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
};

async function updateUserFinancial(req, res) {
    try {
        const { email, ...updates } = req.body;

        // Validate email exists
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is required to identify user" 
            });
        }

        // Check at least two financial parameters are provided
        const providedFields = Object.keys(updates);
        if (providedFields.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: "At least two financial parameters must be provided",
                requiredParameters: ['dAmt', 'iAmt', 'wAmt', 'wBal']
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Validate and prepare updates
        const validFields = {
            dAmt: 'totalDeposit',
            iAmt: 'totalInvestment', 
            wAmt: 'totalWithdrawal',
            wBal: 'walletBalance'
        };

        const updateData = {};
        let hasValidUpdate = false;

        for (const [inputField, dbField] of Object.entries(validFields)) {
            if (updates[inputField] !== undefined) {
                const value = parseFloat(updates[inputField]);
                if (isNaN(value)) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `${inputField} must be a valid number`
                    });
                }
                updateData[dbField] = user[dbField] + value;
                hasValidUpdate = true;
            }
        }

        if (!hasValidUpdate) {
            return res.status(400).json({ 
                success: false, 
                message: "No valid financial parameters provided" 
            });
        }

        console.log(updateData)
        // Update user
        await user.update(updateData);
        
        console.log(user)
        await user.save();
        //shalip23RD@gmail.com
        // Return updated financials
        return res.status(200).json({
            success: true,
            message: "User financials updated successfully",
            data: {
                email: user.email,
                totalDeposit: user.totalDeposit,
                totalInvestment: user.totalInvestment,
                totalWithdrawal: user.totalWithdrawal,
                walletBalance: user.walletBalance
            }
        });

    } catch (error) {
        console.error('Update user financials error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error",
            error: error.message 
        });
    }
}



module.exports = {
    getAllUsers,
    approveDeposit,
    addDeposit,
    approveWithdrawal,
    allDeposit,
    allWithdrawal,
    getAllInvestment,
    getUserDetails,
    updateUserFinancials
}