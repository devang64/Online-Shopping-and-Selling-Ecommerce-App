const mongoose = require("mongoose");
const dotenv = require('dotenv').config();
const url = process.env.DB_URL;

const connectDataBase = ()=>{

    mongoose.connect(url,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((data)=>{
        console.log("Mongo Connection successfull!!")
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = connectDataBase;