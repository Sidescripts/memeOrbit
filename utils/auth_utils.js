const jwt = require("jsonwebtoken");

function generateAccessToken(user){
    
   const x =  jwt.sign({id: user.id, email: user.email}, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: "15m",
    });    
    return x;
    
}

function generateRefreshToken(user){
    
    const x =jwt.sign({id: user.id, email:user.email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '7d',
    });    
    return x
    
}

module.exports = {generateAccessToken, generateRefreshToken}