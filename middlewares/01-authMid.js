const jwt = require("jsonwebtoken");
const db = require('../models/index');
const User = db.User; // Access User model from Sequelize instance

// Basic authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Verify user exists using Sequelize's findByPk (find by primary key)
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user.id, // Sequelize uses 'id' by default
      email: user.email,
      username: user.username,
      // Add any other user fields you need
    };

    next();
  } catch (error) {
    console.log('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
    } else {
      return res.status(500).json({ 
        error: 'Token verification failed',
        code: 'TOKEN_VERIFICATION_FAILED',
        details: error.message
      });
    }
  }
};

module.exports = { authMiddleware };