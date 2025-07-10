const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const User = require('../models/index');
const db = require('../models/index');
const User = db.User;
const { Op } = require('sequelize');
const {generateAccessToken, generateRefreshToken} = require("../utils/auth_utils");
const userService = require("../service/userService");
const {isPasswordStrong} = require("../utils/passwordStrength");
const createHash  = require("../utils/createHash");
const sendCeoMail = require("../utils/welcomeEmail");
const sendVerificationEmail = require("../utils/verificationEmail");
const sendResetPasswordEmail =  require("../utils/resetPasswordEmail");

const origin = 'https://meme-orbit.com';

// Register
const register = async (req, res) => {
  const { username, email, password, country } = req.body;

  try {
    // Input validation
    if(!username || !email || !password || !country){
      return res.status(400).json({error: "Provide all needed value(s)"}) 
    }

    // Password strength validation
    const isStrongpassword = isPasswordStrong(password);
    if(!isStrongpassword){
      return res.status(400).json({
        message: "Password must contain an uppercase and smallcase letters, a number and a special character"
      })
    }

    const user = await userService.createUser({ username, email, password, country});
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    res.status(201).json({ 
      message: 'User registered successfully',  
      username: user.username, 
      email: user.email, 
      accessToken: accessToken, 
      refreshToken: refreshToken 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if(!email || !password){
      return res.status(400).json({error: "Provide the needed value(s)"})
    }

    const user = await userService.findUserByEmail({email});

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({ 
      success: true, 
      username: user.username,
      email: user.email,
      userId: user.id,
      accessToken: accessToken, 
      refreshToken: refreshToken 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Refresh token - IMPROVED VERSION
const refreshToken = async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    // Verify the refresh token (this will automatically check expiration)
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
    const user = await User.findByPk(decoded.id); 
    // console.log(user)

    if (!user || !user.refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Compare hashed refresh token
    const isValidRefreshToken = await bcrypt.compare(token, user.refreshToken);
    if (!isValidRefreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update stored refresh token
    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    res.json({ 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    if (err.name === 'TokenExpiredError') {
      // Clean up expired token
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.id) {
          const user = await User.findByPk(decoded.id);
          if (user) {
            user.refreshToken = null;
            await user.save();
          }
        }
      } catch (cleanupErr) {
        console.error('Token cleanup error:', cleanupErr);
      }
      return res.status(403).json({ error: 'Refresh token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    res.status(403).json({ error: 'Token verification failed' });
  }
};

// Logout - NEW FUNCTION
const logout = async (req, res) => {
  const { token } = req.body;
  
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (user) {
        // Clear refresh token
        user.refreshToken = null;
        await user.save();
      }
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    // Even if token verification fails, we still want to log them out
    res.status(200).json({ message: 'Logged out successfully' });
  }
};

// Forgot Password - IMPROVED
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    if(!email){
      return res.status(400).json({msg: 'Please provide email address'})
    }

    const user = await userService.findUserByEmail({email});
    
    // Always return success message to prevent email enumeration
    const successMessage = 'If an account with that email exists, a password reset link has been sent';
    
    if (user) {
      const passwordResetToken = crypto.randomBytes(70).toString('hex');
      const tenMins = 1000 * 60 * 10; // 10 minutes
      const passwordResetExpires = new Date(Date.now() + tenMins);
      
      user.passwordResetToken = createHash(passwordResetToken);
      user.passwordResetExpires = passwordResetExpires;

      await sendResetPasswordEmail({
        username: user.username,
        email: user.email,
        token: passwordResetToken,
        origin,
      });

      await user.save();
    }
    
    res.status(200).json({ msg: successMessage });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Password reset request failed' });
  }
};

// Reset Password - FIXED
const resetPassword = async (req, res) => {
  const { password, token, email } = req.body;

  try {
    if (!token || !email || !password) {
      return res.status(400).json({msg: 'Provide all required values'});
    }
    
    // Validate password strength
    const isStrongpassword = isPasswordStrong(password);
    if(!isStrongpassword){
      return res.status(400).json({
        message: "Password must contain an uppercase and smallcase letters, a number and a special character"
      })
    }
    
    const user = await userService.findUserByEmail({email});

    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const currentDate = new Date(); // FIX: Define currentDate
    
    if(user.passwordResetToken === createHash(token) && user.passwordResetExpires > currentDate) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.status(200).json({msg: 'Password successfully reset'});
    } else {
      res.status(400).json({ error: 'Invalid or expired token' });
    }
    
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

module.exports = {
  login,
  register,
  refreshToken,
  resetPassword,
  forgotPassword,
  logout // Add logout function
};