const express = require('express');
const {signup, login} = require('../controllers/adminAutth');
const {
    getAllUsers,
    approveDeposit,
    approveWithdrawal,
    allDeposit,
    allWithdrawal
} = require("../controllers/adminMainController");
const {authMiddleware, authorizePermissions} = require("../middlewares/adminAuthMid");
const router = express.Router();

// Signup route
router.post('/signup', signup);
router.post('/login', login);
router.get("/all-users", authMiddleware, authorizePermissions("admin"),getAllUsers);
router.get("/all-wth",  authMiddleware, authorizePermissions("admin"),allWithdrawal);
router.get("/all-deposit",  authMiddleware, authorizePermissions("admin"),allDeposit);
router.post("/approve-deposit",  authMiddleware, authorizePermissions("admin"),approveDeposit);
router.post("/approve-wth",  authMiddleware, authorizePermissions("admin"),approveWithdrawal);

module.exports = router;
