const jwt = require("jsonwebtoken");

async function authMiddleware(req,res,next)  {
    const accessToken = req.headers['accesstoken'];
    
    // Dubemernest@23
    if(!accessToken){
        return res.status(401).json({msg: "Unable To Login! Try again"})
    }

    try {
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) =>{
            if(err){
                return res.status(402).json({msg: "Invalid accessToken"})
            }
            req.user = user;
            console.log(user)
            next();
        });
    } catch (error) {
        console.log("error" + error);

    }
}

module.exports = {authMiddleware};