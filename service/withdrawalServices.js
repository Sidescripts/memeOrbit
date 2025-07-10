const {Withdrawal} = require("../models");

const createWithdrawal = async({userId, amount, trxnId, status, method, euEquAmount, walletAdd}) =>{
    try {
        const withdrawal = await Withdrawal.create({
            userId, amount, trxnId, status, method, euEquAmount, walletAdd
        });
        return withdrawal;
    } catch (error) {
        throw new Error('Error creating withdrawal: ',error.message )
    }
}

const findAllWithdrawal = async() =>{
    try {
        const withdrawals =  await Withdrawal.findAll({});
        return withdrawals
    } catch (error) {
        throw new Error('Error occurred!: ',error.message )
    }
}

const findWithdrawalById = async({id}) =>{
    try {
        const withdrawal = await Withdrawal.findByPk(id);
        if (!withdrawal) throw new Error("Withdrawal not found");
        return withdrawal;
    } catch (error) {
        throw new Error('Error occurred: ', error )
    }
}

const findAllWithdrawalForUser = async({userId}) =>{
    try {
        const withdrawals = await Withdrawal.findAll({ where: { userId } });
        return withdrawals;
    } catch (error) {
        throw new Error(`Error occurred:, ${error}`)
        
    }
}

const findWithdrawalByTrxId = async({trxnId}) =>{
    try {
        const withdrawal = await Withdrawal.findOne({ where: { trxnId } });
        if (!withdrawal) throw new Error("Withdrawal not found");
        return withdrawal;
    } catch (error) {
        throw new Error('Error occurred: ', + error )
        
    }
}

const findAllAllApprovedWithdrawal = async() =>{
    try {
        const withdrawals = await Withdrawal.findAll({ where: { status: 'approved' } });
        return withdrawals;
    } catch (error) {
        throw new Error('Error occurred: ',error.message )
        
    }
}

const findAllAllPendingWithdrawal = async() =>{
    try {
        const withdrawals = await Withdrawal.findAll({ where: { status: 'pending' } });
        return withdrawals;   
    } catch (error) {
        throw new Error('Error occurred: ',error.message )
    }
}

module.exports = {
    findAllWithdrawal,
    findAllWithdrawalForUser,
    findWithdrawalById,
    findWithdrawalByTrxId,
    createWithdrawal,
    findAllAllApprovedWithdrawal,
    findAllAllPendingWithdrawal
}