const bcrypt = require('bcrypt');
const { User } = require('../models');
/**
 * Change user email
 * @param {string} userId - The ID of the user.
 * @param {string} newEmail - The new email to set.
* Change user password
 * @param {string} currentPassword - The current password of the user.
 * @param {string} newPassword - The new password to set.
* @returns {Promise<string>} - Success message.
*/


const createUser = async ({ username, email, password,country }) => {
    // Check if the user already exists
    const existingEmail = await User.findOne({ where: { email } });
    const existingUsername = await User.findOne({where: {username}})
    
    if(existingEmail){
        throw new Error('Email is already taken');
    }

    if (existingUsername) {
        throw new Error('Username is already in use');
    }

    // Hash the password (optional, using bcrypt for example)
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        country
    });

    return user;
};

const findUserByEmail = async({email}) =>{
    const user = await User.findOne({where: {email} });

    if(!user){
        throw new Error("User not found!")
    }
    return user;
}

const findUserById = async({userId}) =>{
    const user = await User.findOne({userId});
    // console.log(user)
    if(!user){
        throw new Error("User not found!")
    }
    return user;
}

const changeEmail = async (userId, newEmail) => {
  try {
    // Check if the email is already in use
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser) {
      throw new Error("Email is already in use");
    }

    // Fetch the user and update the email
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await user.update({ email: newEmail });
    await user.save();
    // Optional: Add logic for sending verification email if required
    // e.g., sendVerificationEmail(newEmail);

    return "Email successfully updated";
  } catch (error) {
    console.error("Error changing email:", error.message);
    throw error;
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Fetch user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await user.update({ password: hashedPassword });
    await user.save();

    return "Password successfully updated";
  } catch (error) {
    console.error("Error changing password:", error.message);
    throw error;
  }
};


module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    changeEmail,
    changePassword
};
