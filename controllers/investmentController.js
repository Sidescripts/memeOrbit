const nodeCron = require("node-cron");
const  {v4: uuidv4} = require("uuid");
const  {User} = require('../models') 
const  {Investment} = require('../models') 
const {
    findAllInvestment,
    findInvestmentById,
    findInvestmentByTrxId,
    createInvestmentservice,
    findAllInvestmentForUser,
    findAllCompletedInvestment,
    findAllOngoingInvestment,
    findMostRecentInvestment,
    getSingleInvestmentById
} = require("../service/investmentService");

const {findUserById} = require("../service/userService");

// create innvestment
async function createInvestment(req,res) {
    const {plans, amount} = req.body;
    const {userId} = req.user;

    try{
        
        const user =await User.findByPk(userId);
        
        // console.log(user);
        if(!user){
            // console.log("error")
            return res.status(404).json({msg: "User Not Found!"})
        }

        if(!plans || !amount){
            console.log("error")
            return res.status(400).json({ message: "Please provide the needed value(s)" });
        }

        // // Determine the duration based on the plan
        let duration;
        switch (plans.toLowerCase()) {
            case "basic plan":
                duration = 24; // 24 hours
                break;
            case "moon plan":
                duration = 48; // 48 hours
                break;
            case "boom plan":
                duration = 72; // 72 hours
                break;
            default:
                return res.status(400).json({ message: "Invalid plan selected." });
        }
        
        const investmentDate = new Date();
        
        // // Deduct investment amount from walletBalance
        if (amount > user.walletBalance) {
            return res.status(400).json({ 
                success: false,
                message: "Insufficient funds for this investment" 
            });
            // throw new Error("Insufficient Fund");
        }
  
        user.walletBalance -= amount,
        user.totalInvestment += amount

        await user.save();
        
        const i = await Investment.create({
            userId: userId,
            plans: plans,
            amount:amount,
            investmentId: uuidv4(),
            investmentDate: investmentDate,
            duration:duration,
            returnOnInvestment: 0
        });
        // console.log(i)
        return res.status(201).json({successs:true, msg: "success!", i})

            
    } catch (error) {
        console.log(error)
    }    

}

// investment history
async function getAllInvestment(req,res) {
    // console.log("get all investment")
    try {
        // console.log(req)
        const {userId} = req.user;
        
        console.log(userId)

        const investment = await findAllInvestmentForUser({userId})
    
        if(investment.length === 0 ){
            return res.status(404).json({msg: "No investment history currently!!"})
        }

        console.log(investment)
        res.status(200).json({success:true, investment});
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

// investment receipt
async function getOneInvestment(req,res) {
    try {
        const userId = req.user.id;
        const { investmentId } = req.params;

        const investment = await getSingleInvestmentById(investmentId, userId);

        res.status(200).json({
            success: true,
            data: investment,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

const adminUpdateInvestment = async (req, res) => {
    const { investmentId } = req.params;
    
    try {
        const investment = await Investment.findOne({ where: { id: investmentId } });
        
        if (!investment) {
            return res.status(404).json({ msg: `Investment with ID ${investmentId} not found` });
        }

        if (investment.status !== 'ongoing') {
            return res.status(400).json({ msg: 'Investment is already completed' });
        }
        
        const { investmentDate, amount, plans, userId } = investment;
        
        if (!investmentDate) {
            return res.status(400).json({ msg: 'Investment date is missing' });
        }

        if (!userId) {
            return res.status(400).json({ msg: 'Incorrect UserId' });
        }

        // Set duration and ROI multiplier based on plan
        let durationHours, roiMultiplier;
        switch (plans.toLowerCase()) {
            case 'basic plan':
                durationHours = 24;
                roiMultiplier = 5; // 5x ROI for basic plan
                break;
            case 'moon plan':
                durationHours = 48;
                roiMultiplier = 10; // 10x ROI for moon plan
                break;
            case 'boom plan':
                durationHours = 72;
                roiMultiplier = 20; // 20x ROI for boom plan
                break;
            default:
                return res.status(400).json({ msg: `Invalid plan: ${plans}` });
        }

        const expirationTime = new Date(investmentDate).getTime() + durationHours * 60 * 60 * 1000;
        const currentTime = Date.now();

        if (currentTime < expirationTime) {
            return res.status(400).json({ msg: 'Investment duration has not been completed yet' });
        }

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ msg: `User with ID ${userId} not found` });
        }
      
        const currentBalance = parseFloat(user.walletBalance) || 0;
        const roi = parseFloat(amount) * roiMultiplier;

        // Update investment
        investment.status = 'completed';
        investment.returnOnInvestment = roi; // Store the calculated ROI
        await investment.save();

        // Update user wallet
        user.walletBalance = currentBalance += roi;
        // user.walletBalance = parseFloat((currentBalance + roi).toFixed(2));
        await user.save();
        
        return res.status(200).json({
            msg: 'Investment successfully updated',
            updatedInvestment: {
                email: user.email,
                investmentId: investment.investmentId,
                status: investment.status,
                returnOnInvestment: investment.returnOnInvestment,
                duration: durationHours,
                plan: investment.plans,
                amount: investment.amount,
                date: investmentDate,
                roiMultiplier: roiMultiplier // Include multiplier in response for transparency
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = {
    createInvestment,
    getAllInvestment,
    getOneInvestment,
    adminUpdateInvestment
}