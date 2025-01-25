const userService = require("../service/userService");
const crypto = require('crypto');
const {generateUniqueShortId, generateUniquieId} = require("../utils/generateId")
const {isPasswordStrong} = require("../utils/passwordStrength");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const createHash  = require("../utils/createHash");
const sendCeoMail = require("../utils/welcomeEmail");
const sendVerificationEmail = require("../utils/verificationEmail");
const sendResetPasswordEmail =  require("../utils/resetPasswordEmail");
const origin = 'https://meme-orbit.com';

const signup = async (req, res) => {
    try {
        const { username, email, password, referralLink, country} = req.body;
        const genRefCode = generateUniqueShortId();
        const isStrongpassword = isPasswordStrong(password);
        
        if(!username || !email || !password || !country){
            return res.status(400).json({message: "Provide all needed value(s)!"})
        }
    
        if(!isStrongpassword){
            return res.status(400).json({message: "Password must contain an uppercase and smallcase letters, a number and a special character"})
        }
        
        const verificationToken = crypto.randomBytes(40).toString('hex');

        const user = await userService.createUser({ username, email, password, country, referralLink, verificationToken });
        
        const tokenUser = {
            userId: user.id,
            username: user.username,
            email: user.email,
            country: user.country,
            referralLink: user.referralLink,
        }
        let refresh_token = crypto.randomBytes(40).toString('hex');

        const accessToken = jwt.sign(tokenUser, process.env.JWT_SECRET,{expiresIn:'1h'});
        const refreshToken = jwt.sign({tokenUser,refresh_token}, process.env.JWT_SECRET,{expiresIn:'1h'});
        
        // send email from ceo
        await sendCeoMail({username: username, email:email});

        // const origin = 'https://meme-orbit.com' // will still be changed

        await sendVerificationEmail({
            username: user.username,
            email: user.email,
            verificationToken: user.verificationToken,
            origin
        });
    
        return res.status(201).json({ message: 'User created successfully',
            username: user.username,
            email: user.email,
            userId: user.id,
            verificationToken,
            accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

async function login(req,res){
    const {email,password} = req.body;

    if(!email||!password){
        return res.status(400).json({msg: "Provided the needed value(s)"})
    }

    const user = await userService.findUserByEmail({email})
    
    if(!user){
        return res.status(400).json({msg: `User doesn't exist, Please sign up`});
    }
   
    const isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch){
       return res.status(400).json({msg: `Invalid Credentials! Try again`});
    }

    // if(!user.isVerified){
    //     return res.status(400).json({msg: "Verify your account address"});
    // }

    
    const tokenUser = {
        userId: user.id,
        username: user.username,
        email: user.email,
        country: user.country,
        referralLink: user.referralLink,
    }
    let refresh_token = '';

    refresh_token = crypto.randomBytes(40).toString('hex');

    const accessToken = jwt.sign(tokenUser, process.env.JWT_SECRET,{expiresIn:'1h'});
    const refreshToken = jwt.sign({tokenUser,refresh_token}, process.env.JWT_SECRET,{expiresIn:'1h'});
    
    res.status(201).json({
        success:true, 
        username: user.username,
        email: user.email,
        userId: user.id,
        accessToken,
        refreshToken
    });

}

const verifyEmail = async(req,res) =>{

    const {email, verificationToken} = req.body;

    if(!email){
        return res.status(400).json({msg: 'Please provide the needed value'}) 
    }

    const user = await userService.findUserByEmail({email});

    if(!user){
        return res.status(400).json({msg: 'User does not exist!'})
    }

    if(user.verificationToken !== verificationToken){
       return res.status(400).json({msg: 'Verification Token mismatch!!'}) 
    }

    user.isVerified = true,
    user.verificationDate =  Date.now(),
    user.verificationToken = ''

    await user.save();
    
    return res.status(200).json({msg: 'Email verified'});
}

// reset password token
const forgotPassword = async(req,res) =>{
    const {email} = req.body;
  
    if(!email){
        return res.status(400).json({msg: 'Please provide the needed value'})
    }
  
    const user = await userService.findUserByEmail({email});

    if(user){
      const passwordResetToken = crypto.randomBytes(70).toString('hex');
  
      
  
        // const origin = 'http://localhost:3000'
  
      const tenMins = 1000 * 60 * 10;
      const passwordResetExpires = new Date(Date.now() + tenMins);
      
      user.passwordResetToken = createHash(passwordResetToken)
      user.passwordResetExpires = passwordResetExpires
  
        await sendResetPasswordEmail({
            username: user.username,
            email: user.email,
            token: passwordResetToken,
            origin,
        });


      await user.save();
        // res
        //     .status(200)
        //     .json({
        //         user:user,
        //         passwordResetToken
        // });
    }else{
        res.status(200).json({msg: `Please check your email for rest password link`});

    }
    // res.status(200).json({msg: `Please check your email for rest password link`});
}

const resetPassword = async (req, res) => {
    const { token, email, password} = req.body;
    if (!token || !email || !password) {
        return res.status(400).json({msg: `Provide the needed value(s)`});
    
    }

    const user = await userService.findUserByEmail({email});

    if (user) {
      const currentDate = new Date();
        
        if(user.passwordResetToken === createHash(token) && user.passwordResetExpires > currentDate) {

            user.password = password;
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            await user.save();

            res.status(200).json({msg: 'Password successfully reseted'});
        }

    
    }
  
};


module.exports = {
    signup,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword
};
