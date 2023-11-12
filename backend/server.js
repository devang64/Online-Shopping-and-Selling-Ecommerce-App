const app = require('./app')
// const dotenv = require('dotenv').config();
const port = process.env.PORT;
const connectDataBase = require('./db')
const cloudinary = require('cloudinary')
connectDataBase()
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config();
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`)
})