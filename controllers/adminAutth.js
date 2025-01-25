const  adminServices = require("../service/adminServices");
const crypto = require('crypto');
const {generateUniqueShortId, generateUniquieId} = require("../utils/generateId")
const {isPasswordStrong} = require("../utils/passwordStrength");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const createHash  = require("../utils/createHash");

const signup = async (req, res) => {
    const {email, password} = req.body;
    const isStrongpassword = isPasswordStrong(password);
    try {
        
        if(!email || !password){
            return res.status(400).json({message: "Provide all needed value(s)"})
        }
    
        if(!isStrongpassword){
            return res.status(400).json({message: "Password must contain an uppercase and smallcase letters, a number and a special character"})
        }
        
        const admin = await adminServices.createUser({email,password});
        
        const token = {
            adminId: admin.id,
            email: admin.email
        }
       
        const accessToken = jwt.sign(token, process.env.JWT_SECRET,{expiresIn:'30m'});
    
        return res.status(201).json({ 
            message: 'Admin created successfully',
            email: admin.email,
            adminId: admin.id,
            accessToken
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

    const admin = await adminServices.findAdminByEmail({email});
    
    if(!admin){
        return res.status(400).json({msg: `Admin doesn't exist, Please sign up`});
    }
   
    const isMatch = await bcrypt.compare(password, admin.password)
    
    if(!isMatch){
       return res.status(400).json({msg: `Invalid Credentials! Try again!`});
    }
    
    const token = {
            adminId: admin.id,
            email: admin.email
    }
    
    const accessToken = jwt.sign(token, process.env.JWT_SECRET,{expiresIn:'30m'});

    res.status(201).json({
        success:true, 
        email: admin.email,
        adminId: admin.id,
        accessToken,
    });

}

module.exports = {
    signup,
    login,
};
