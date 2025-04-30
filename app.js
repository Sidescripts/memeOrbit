
require('express-async-errors');
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors =  require("cors");
const path =  require("path")
const authRouter = require("./routes/authRoute");
const depositRouter = require("./routes/depositRoute");
const withdrawalRouter = require("./routes/withdrawalRoute");
const investmentRouter = require("./routes/investmentRoute");
const mainRouter = require("./routes/userRoute");
const adminRouter = require("./routes/adminRoute");
const db =  require("./models")
const app = express();

const allowedOrigins = [  
    'https://meme-orbit-admin.netlify.app',
    "http://localhost:5501"

];

const corsOpt = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}


app.set('trust proxy', 1)
app.use(express.json());
app.use(express.static(path.resolve(__dirname, './public')))
app.use(cors(corsOpt));
app.use(morgan("dev"));

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/withdrawal', withdrawalRouter);
app.use('/api/v1/deposit', depositRouter);
app.use('/api/v1/investment', investmentRouter);
app.use('/api/v1/m', mainRouter);
app.use("/api/v1/admin", adminRouter);

app.get("/health-check", (req,res) =>{
    res.status(200).json({
        success:true, 
        msg: 'Health check successful!!'
    })
});


const port = process.env.PORT || 3040;

//for prod
db.sequelize.sync({alter: true}).then(() =>{
    console.log("Db synced")
    app.listen(port,()=>{
        console.log(`server started on port ${port}`)
    });
}).catch(err =>{
    console.error("sync error occurred:", err)
});

//for local
// async function startServer(){
//     try {
//         app.listen(port,()=>{
//             console.log(`server started on port ${port}`)
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }

// startServer();