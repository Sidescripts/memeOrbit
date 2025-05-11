const {Investment} = require("../models");
const {v4: uuidv4} = require("uuid");
/**
 * Finds the most recent investment for a user.
 * @param {Object} params - The parameters for the query.
 * @param {string} params.userId - The user's ID.
 * @param {object} investmentData
 *  @param {string} userId - User ID
 * @param {string} investmentId
 * @returns {Promise<Array>} - List of investments
 * @returns {Promise<Object|null>} - The most recent investment or null if none exist. 
*/

const findMostRecentInvestment = async ({ userId }) => {
  try {
    // Query for the most recent investment by createdAt timestamp
    const recentInvestment = await Investment.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]], // Orders by the most recent investment
    });

    return recentInvestment;
  } catch (error) {
    console.error("Error fetching most recent investment:", error.message);
    throw new Error("Unable to fetch most recent investment.");
  }
};


const createInvestmentservice = async({userId, plans, amount, duration, investmentId, investmentDate, status, returnOnInvestment}) =>{

    try {
        const investment = await Investment.create({
            userId, plans, amount, duration, investmentId, investmentDate, status, returnOnInvestment
        });
        return investment;
    } catch (error) {
        throw new Error('Error occurred: ',error.message )
    }
}

const findAllInvestment = async({}) =>{
    try {
        const investment = await Investment.findAll({});
        return investment;
    } catch (error) {
        throw new Error('Error occurred!: ',error.message )
    }
}

const findMostRecentCompletedInvestment = async ({ userId }) => {
  try {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const recentInvestment = await Investment.findOne({
      where: {
        userId,
        status: "completed", // Adjust this if your model uses a different field or value
      },
      order: [["createdAt", "DESC"]],
    });

    return recentInvestment;
  } catch (error) {
    console.error("Error fetching most recent completed investment:", error.message);
    throw new Error("Unable to fetch most recent completed investment.");
  }
};



const findAllInvestmentBasedOnDate = async({}) =>{
    try {
        const investment = await Investment.findAll({
            where: { userId },
            order: [["investmentDate", "DESC"]],
        });

        if (!investment.length) {
            throw new Error("No investments found for this user");
        }
        return investment;
    } catch (error) {
        throw new Error('Error occurred!: ',error.message )
    }
}

const getSingleInvestmentById = async (investmentId, userId) => {
  const investment = await Investment.findOne({
    where: { id: investmentId, userId },
    include: [{ model: User, as: "user", attributes: ["username", "email"] }],
  });

  if (!investment) {
    throw new Error("Investment not found or does not belong to this user");
  }

  return investment;
};

const findInvestmentById = async({id}) =>{
    try {
        const investment = await Investment.findByPk(id);
        if(!investment) throw new Error("No Inestment");
        return investment;
    } catch (error) {
        throw new Error('Error occurred: ',error.message )
    }
}

const findAllInvestmentForUser = async({userId}) =>{
    try {
        const investment = await Investment.findAll({where: {userId}});
        return investment;
    } catch (error) {
        throw new Error('Error occurred: ',error.message )
    }
}

const findInvestmentByTrxId = async({investmentId}) =>{
    try {
        const investment = await Investment.findAll({where: {investmentId}});
        if(!investment) throw new Error("Investment Not Found");
        return investment;
    } catch (error) {
        throw new Error('Error occurred: ',error.message )
    }
}

const findAllOngoingInvestment = async() =>{
    try {
        const investment = await Investment.findAll({ where: { status: 'ongoing' }})
        return investment
    } catch (error) {
        throw new Error("Error Occurred: ", error.message)
    }
}

const findAllCompletedInvestment = async() =>{
    try {
        const investment = await Investment.findAll({ where: { status: 'completed' }})
        return investment
    } catch (error) {
        throw new Error("Error Occurred: ", error.message)
    }
}

module.exports = {
    findAllInvestment,
    findInvestmentById,
    findInvestmentByTrxId,
    createInvestmentservice,
    findAllInvestmentForUser,
    findAllCompletedInvestment,
    findAllOngoingInvestment,
    findMostRecentInvestment,
    getSingleInvestmentById,
    findAllInvestmentBasedOnDate,
    findMostRecentCompletedInvestment
}