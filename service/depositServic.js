const {Deposit} = require("../models");

const createdeposit = async({userId, method, status, amount, euEquAmount, trxnId}) =>{
    try {
        const deposit = await Deposit.create({
            userId, amount, status, method,trxnId, euEquAmount
        });
        return deposit;
    } catch (error) {
        throw new Error("Error occurred", error)
    }
}

const findAllDeposit = async() =>{
    try {
        const deposit = await Deposit.findAll({});
        return deposit;
    } catch (error) {
        throw new Error("Error occurred", error)
    }
}

const findDepositById = async({id}) =>{
    try {
        const deposit = await Deposit.findByPk(id);
        if(!deposit) throw new Error("Deposit not found");
        return deposit
    } catch (error) {
        throw new Error("Error occurred", error)
    }
}

const findAllDepositForUser = async({userId}) =>{
    try {
        // const deposit = await Deposit.findAll({where: {userId}});
        const deposit = await Deposit.findAll({where: {userId:userId}});
        return deposit;
    } catch (error) {
        console.log(error)
        throw new Error("Error occurred", error)
    }
}

const findDepositByTrxId = async({trxnId}) =>{
    try {
        const deposit = await Deposit.findOne({where: {trxnId}});
        if(!deposit) throw new Error("Deposit not found")
        return deposit;
    } catch (error) {
        throw new Error("Error occurred", error.message)
    }
}

const findAllAllApprovedDeposit = async() =>{
    try {
        const deposit = await Deposit.findAll({where: {status: 'approved'}})
        return deposit;
    } catch (error) {
        throw new Error("Error occurred", error.message)
        
    }
}

const findAllAllPendingDeposit = async() =>{
    try {
        const deposit =await Deposit.findAll({where: {status: 'pending'}});
        return deposit
    } catch (error) {
        throw new Error("Error occurred", error.message)
    }
}

module.exports = {
    findAllDeposit,
    findAllDepositForUser,
    findDepositById,
    findDepositByTrxId,
    createdeposit,
    findAllAllApprovedDeposit,
    findAllAllPendingDeposit
}