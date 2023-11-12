const express = require("express");
const app = express();
const product = require("./router/productRoute");
const errorMiddleware = require("./Middleware/Error");
const user = require("./router/userRoutes");
const cookieParser = require("cookie-parser");
const orderRoutes = require('./router/orderRoute')
const payment = require('./router/paymentRoute')
var cors = require('cors');
// require('dotenv').config();
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require('path')
app.use(bodyParser.urlencoded({extended :true} ))
app.use(fileUpload({
    useTempFiles:true
}))
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config();
  }
app.use(cors()) // Use this after the variable declaration
app.use(express.json());
app.use(cookieParser())
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", payment);


// middleware for error
app.use(errorMiddleware);
app.use(express.static(path.join(__dirname,'../frontend/build')));
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,'../frontend/build/index.html'))
})

module.exports = app;
