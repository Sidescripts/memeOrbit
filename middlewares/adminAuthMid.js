const jwt = require("jsonwebtoken");

// function authorizePermissions(...roles){
//     return (req,res,next) =>{
//         if(!roles.includes(req.user.role)){
//             throw new Error("Not an admin")
//         }
//         next();
//     }
// }

async function authMiddleware(req,res,next)  {
    const accessToken = req.headers['accesstoken'];
    
    if(!accessToken){
        return res.status(401).json({msg: "Unable To Login! Try again"})
    }

    jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) =>{
        if(err){
            return res.status(402).json({msg: "Invalid accessToken"})
        }
        req.user = user;
        next();
    })
}

module.exports = {authMiddleware};