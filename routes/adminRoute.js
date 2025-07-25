const express = require('express');
const {signup, login} = require('../controllers/adminAutth');
const {
    getAllUsers,
    approveDeposit,
    approveWithdrawal,
    allDeposit,
    allWithdrawal,
    addDeposit,
    getAllInvestment,
    getUserDetails,
    updateUserFinancials
} = require("../controllers/adminMainController");
const  {adminUpdateInvestment} = require("../controllers/investmentController");
const {authMiddleware} = require("../middlewares/adminAuthMid");
const router = express.Router();

// Signup route
router.post('/signup', signup);
router.post('/login', login);
router.get("/all-users", authMiddleware,getAllUsers);
router.get("/all-investment", authMiddleware,getAllInvestment);
router.get("/all-wth",  authMiddleware,allWithdrawal);
router.get("/all-deposit",  authMiddleware,allDeposit);
router.patch("/approve-deposit/:id",  authMiddleware,approveDeposit);
router.patch("/add-deposit/:id",  authMiddleware,addDeposit);
router.patch("/approve-wth/:id",  authMiddleware,approveWithdrawal);
router.patch('/update-investment/:investmentId', authMiddleware, adminUpdateInvestment);
router.post("/get-user-details", authMiddleware, getUserDetails);
router.post("/update-finance", authMiddleware, updateUserFinancials);


module.exports = router;
