const express = require('express');
const {signup, login} = require('../controllers/adminAutth');
const {
    getAllUsers,
    approveDeposit,
    approveWithdrawal,
    allDeposit,
    allWithdrawal,
    addDeposit
} = require("../controllers/adminMainController");
const {authMiddleware} = require("../middlewares/adminAuthMid");
const router = express.Router();

// Signup route
router.post('/signup', signup);
router.post('/login', login);
router.get("/all-users", authMiddleware,getAllUsers);
router.get("/all-wth",  authMiddleware,allWithdrawal);
router.get("/all-deposit",  authMiddleware,allDeposit);
router.patch("/approve-deposit/:id",  authMiddleware,approveDeposit);
router.patch("/add-deposit/:id",  authMiddleware,addDeposit);
router.patch("/approve-wth/:id",  authMiddleware,approveWithdrawal);

// router.patch("/add-deposit/:id",  authMiddleware,(req,res) =>{
//     console.log("this might be working")
// });


module.exports = router;
