const express = require('express');
const {register, login, refreshToken, resetPassword, forgotPassword} = require("../controllers/mainAuth")
const router = express.Router();

// Signup route
router.post('/signup', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;
