const nodemailer = require("nodemailer");
// const nodemailerConfig = require("../config/nodemailer.config");

const sendEmail = ({to,subject,html}) =>{

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        service: 'gmail',
        auth: {
            user: "memeorbit80@gmail.com",
            pass: "plqk pauc vcyi uvxh"
            // user: process.env.EMAIL_USERNAME,
            // pass: process.env.EMAIL_PASSWORD
        }
    });

    // transporter.sendMail
    
    return transporter.sendMail({
        from: 'Meme-Orbit',
        to,
        subject,
        html,
    } , (error, info) =>{
        if(error){
            console.log(error)
            // return error;
            
        }else{
            console.log("email sent:" + info)
            // return true
        }
    });
};


module.exports = {sendEmail};