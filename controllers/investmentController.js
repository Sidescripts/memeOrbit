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
        // console.log(duration)
        
        const investmentDate = new Date();
        // console.log(investmentDate)
        
        // // Deduct investment amount from walletBalance
        if (amount > user.walletBalance) {
            throw new Error("Insufficient Fund");
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

const updateReturnOnInvestment = async(req,res) =>{
    const userId = req.user;
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


const adminUpdateInvestment = async (req, res) => {
    const userId = req.user;
    const { investmentId } = req.params;

    try {
        // const investment = await findInvestmentById(investmentId);

        const investment = await Investment.findByPk(investmentId);


        if (!investment) {
            return res.status(404).json({ msg: `Investment with ID ${investmentId} not found` });
        }

        if (investment.status !== 'ongoing') {
            return res.status(400).json({ msg: 'Investment is already completed' });
        }
        console.log(investment)
        const { investmentDate, amount, plans } = investment;

        if (!investmentDate) {
            return res.status(400).json({ msg: 'Investment date is missing' });
        }

        // Set duration based on plan
        let durationHours;
        switch (plans.toLowerCase()) {
            case 'basic plan':
                durationHours = 24;
                break;
            case 'moon plan':
                durationHours = 48;
                break;
            case 'boom plan':
                durationHours = 72;
                break;
            default:
                return res.status(400).json({ msg: `Invalid plan: ${plans}` });
        }

        const expirationTime = new Date(investmentDate).getTime() + durationHours * 60 * 60 * 1000;
        const currentTime = Date.now();

        if (currentTime < expirationTime) {
            return res.status(400).json({ msg: 'Investment duration has not been completed yet' });
        }

        // Find user
        const user = await findUserById({ userId });

        if (!user) {
            return res.status(404).json({ msg: `User with ID ${userId} not found` });
        }

        const roi = parseFloat(amount) * 5;

        investment.status = 'completed',
        investment.returnOnInvestment += roi
        await investment.save();
        user.walletBalance += roi
        await user.save();
        
        return res.status(200).json({
            msg: 'Investment successfully updated',
            updatedInvestment: {
                email: user.email,
                investmentId: investment.investmentId,
                status: investment.status,
                returnOnInvestment: investment.returnOnInvestment,
                duration: investment.duration,
                plan: investment.plan,
                amount: investment.amount,
                date: investmentDate
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};


// Configuration object for investment plans and durations
const PLAN_CONFIG = {
  'basic plan': { durationHours: 24, name: 'Basic Plan' },
  'moon plan': { durationHours: 48, name: 'Moon Plan' },
  'boom plan': { durationHours: 72, name: 'Boom Plan' },
};

// Constants
const ROI_MULTIPLIER = 5; // 500% return on investment
const STATUS_ONGOING = 'ongoing';
const STATUS_COMPLETED = 'completed';

// Helper functions
const getPlanConfig = (plan) => {
  const normalizedPlan = plan?.toLowerCase();
  return PLAN_CONFIG[normalizedPlan] || null;
};

const calculateExpirationTime = (investmentDate, durationHours) => {
  if (!investmentDate) throw new Error('Investment date is missing');
  return new Date(investmentDate).getTime() + durationHours * 60 * 60 * 1000;
};

const validateInvestment = (investment) => {
  if (!investment) {
    throw new Error('Investment not found');
  }
  if (investment.status !== STATUS_ONGOING) {
    throw new Error('Investment is already completed');
  }
};

const validateUser = (user) => {
  if (!user) {
    throw new Error('User not found');
  }
};

const calculateRoi = (amount) => {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid investment amount');
  }
  return parsedAmount * ROI_MULTIPLIER;
};

// Main function
const adminUpdateInvestmentl = async (req, res) => {
  const { investmentId } = req.params;
  const userId = req.user; // Assumed to be set by authMiddleware

  try {
    // Fetch investment
    const investment = await Investment.findByPk(investmentId);
    validateInvestment(investment);

    const { investmentDate, amount, plans } = investment;

    // Validate plan and get duration
    const planConfig = getPlanConfig(plans);
    if (!planConfig) {
      return res.status(400).json({ message: `Invalid plan: ${plans}` });
    }

    // Check if duration has been reached
    const expirationTime = calculateExpirationTime(investmentDate, planConfig.durationHours);
    const currentTime = Date.now();

    if (currentTime < expirationTime) {
      const remainingMs = expirationTime - currentTime;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return res.status(400).json({
        message: `Investment duration for ${planConfig.name} has not been completed. ${remainingHours} hours remaining.`,
      });
    }

    // Fetch user
    const user = await findUserById({ userId }); // Assumes findUserById is defined
    validateUser(user);

    // Calculate ROI
    const roi = calculateRoi(amount);

    // Update investment and user wallet in a transaction
    await Investment.sequelize.transaction(async (t) => {
      await investment.update(
        {
          status: STATUS_COMPLETED,
          returnOnInvestment: roi,
        },
        { transaction: t }
      );

      await user.update(
        {
          walletBalance: parseFloat(user.walletBalance || 0) + roi,
        },
        { transaction: t }
      );
    });

    // Prepare response
    const responseData = {
      message: 'Investment successfully updated',
      updatedInvestment: {
        email: user.email,
        investmentId: investment.investmentId,
        status: investment.status,
        returnOnInvestment: investment.returnOnInvestment,
        duration: planConfig.durationHours,
        plan: planConfig.name,
        amount: parseFloat(amount),
        date: investmentDate,
      },
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error updating investment:', error);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      message: error.message || 'Server error',
    });
  }
};


module.exports = {
    createInvestment,
    getAllInvestment,
    getOneInvestment,
    updateReturnOnInvestment,   
    adminUpdateInvestment
}