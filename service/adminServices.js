const bcrypt = require('bcrypt');
const { Admin } = require('../models');

/**
 * Change user email
 * @param {string} adminId - The ID of the user.
 * @param {string} newEmail - The new email to set.
* Change user password
 * @param {string} currentPassword - The current password of the user.
 * @param {string} newPassword - The new password to set.
* @returns {Promise<string>} - Success message.
*/


const createUser = async ({email, password}) => {
    // Check if the user already exists
    const existingEmail = await Admin.findOne({ where: { email } });
    
    if(existingEmail){
        throw new Error('Email is already taken');
    }

    // Hash the password (optional, using bcrypt for example)
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const admin = await Admin.create({
        email,
        password: hashedPassword
    });

    return admin;
};

const findAdminByEmail = async({email}) =>{
    const admin = await Admin.findOne({where: {email} });

    if(!admin){
        throw new Error("User not found!")
    }
    return admin;
}

const findAdminById = async({adminId}) =>{
    const admin = await Admin.findOne({where: {adminId} });

    if(!admin){
        throw new Error("User not found!")
    }
    return admin;
}


module.exports = {
    createUser,
    findAdminByEmail,
    findAdminById
};
