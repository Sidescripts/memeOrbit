const express = require('express');
const {getAndUpdateDashboard, testDashB} = require("../controllers/dashboard");
const {authMiddleware} = require("../middlewares/01-authMid")
const {handleChangePassword, handleChangeEmail} =require("../controllers/userController")
const router = express.Router();


router.get("/dashboard", authMiddleware,getAndUpdateDashboard)
// router.get('/dashboard', test,authMiddleware,getAndUpdateDashboard);
router.patch("/change-password", authMiddleware,handleChangePassword);
router.patch("/change-email", authMiddleware,handleChangeEmail)

module.exports = router;
