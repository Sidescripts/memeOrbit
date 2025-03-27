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
        console.log(duration)
        
        const investmentDate = new Date();
        console.log(investmentDate)
        
        // // Deduct investment amount from walletBalance
        if (amount > user.walletBalance) {
            throw new Error("Insufficient Fund");
        }

        // await user.update({
            // walletBalance: user.walletBalance - amount,
            // totalInvestment: user.totalInvestment + amount,
        // });

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
        console.log(i)
        return res.status(201).json({successs:true, msg: "success!", i})

            
    } catch (error) {
        console.log(error)
    }    
    
    
    

}

const updateReturnOnInvestment = async(req,res) =>{
    const userId = req.user.id;
    const investments =  await findAllOngoingInvestment();
    const user = await findUserById({userId});

    for (const investment of investments){
        const {investmentDate, amount, plans} = investment;

        // Determine the duration based on the plan
        let duration;
        switch (plans.toLowerCase()) {
            case "basic":
                duration = 24; // 24 hours
                break;
            case "moon":
                duration = 48; // 48 hours
                break;
            case "boom":
                duration = 72; // 72 hours
                break;
            default:
                console.error(`Invalid plan '${plans}' for investment ID ${investment.id}`);
                continue; // Skip invalid plans
        }

        // check if duration has expired
        const expirationTime = investment.investmentDate.getTime() + duration * 60 * 60 * 1000;
        const currentTime = Date.now();

        if(currentTime >= expirationTime){
            const roi = 5 * amount;

            await investment.update({
                status: "completed",
                returnOnInvestment: roi,
            });

            //
            if(user){
                await user.update({
                    walletBalance: user.walletBalance + roi,
                });

            }else{
                return res.status(404).json({msg: `User with ID ${userId} not found for investment ID ${investment.id}`})
            }
        }
    }
}


// Run every hour
nodeCron.schedule("0 * * * *", async () => {
  console.log("Running ROI update...");
  await updateReturnOnInvestment();
});


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

module.exports = {
    createInvestment,
    getAllInvestment,
    getOneInvestment,
    updateReturnOnInvestment   
}