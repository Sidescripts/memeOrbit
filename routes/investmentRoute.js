const express = require('express');
const {
   createInvestment,
   getAllInvestment,
   getOneInvestment 
} = require("../controllers/investmentController");
const router = express.Router();

const { userAuthMiddleware, authMiddleware} = require("../middlewares/01-authMid");


// Create investment
router.post("/create", authMiddleware,createInvestment);

// Get investment history
router.get("/history", authMiddleware,getAllInvestment);

// Get single investment receipt
router.get("/:investmentId", authMiddleware,getOneInvestment);

module.exports = router;

