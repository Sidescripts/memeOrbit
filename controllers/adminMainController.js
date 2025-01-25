const {User, Deposit, Withdrawal} = require("../models")

const getAllUsers = async(req,res) =>{
    const {email} = req.query;
    const queryObject = {};
    if(email){
        queryObject.email = {$regex: email, $options:'i'}
    }

    let result = await User.find(queryObject).select('-password');;
    const users = result;
    return res.status(StatusCodes.OK).json({success:true, count: users.length, users})
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

    let result = await Deposit.find(queryObject);

    const deposit = result;

    return res.status(StatusCodes.OK).json({success:true, count: deposit.length,deposit});
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

    let result = await Withdrawal.find(queryObject);
    const withdrawal = result;
    return res.status(StatusCodes.OK).json({success:true, withdrawal})
}

const approveWithdrawal = async(req,res)=>{
    const {id:withdrawalId} = req.params;
    const withdrawalApprove = await Withdrawal.findOne({where:{id: withdrawalId}});
    if(!withdrawalApprove){
        throw new Error("Withdrawal not found")
    }
    withdrawalApprove.status = "approved";

    await withdrawalApprove.save();

    return res.status(StatusCodes.OK).json({success:true, withdrawalApprove});
}

const approveDeposit = async(req,res) =>{

    const {id:depositId} = req.params; 
    
    const depositAprrove = await Deposit.findOne({where:{id: depositId}});
    if(!depositAprrove){
        throw new Error("No deposit with id "+ depositId);
    } 

    depositAprrove.status = "approved";
    await depositAprrove.save();
    
    return res.status(StatusCodes.OK).json({success:true, msg: "Deposit successfully approved", depositAprrove})
}

const addDeposit = async(req,res) =>{
    const {id:userId} = req.params;
    const {amount} = req.body;
    if(!amount){
        throw new Error("Amount must be provided!")
    }

    const user = await User.findOne({where:{id: userId}});
    if(!user){
        throw new Error("No user found")
    }
    user.walletBalance += amount;

    await user.save();
    return res.status(StatusCodes.OK).json({success:true, msg: "Deposit successfully made", user})
}

module.exports = {
    getAllUsers,
    approveDeposit,
    addDeposit,
    approveWithdrawal,
    allDeposit,
    allWithdrawal
}