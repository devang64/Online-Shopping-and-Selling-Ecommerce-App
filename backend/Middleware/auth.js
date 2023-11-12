const jwt = require("jsonwebtoken");
const dotenv = require('dotenv').config();
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModel");

const config = process.env;
exports.verifyUserAuthenticate = async (req, res, next) => {
  const { token } = req.cookies;
  //   console.log(token)
  if (!token) {
    return next(new ErrorHandler("Please Login to access resource", 403));
  }
  const decoded = jwt.verify(token, config.JWT_SECRETKEY);
  req.user = await User.findById(decoded.user_id);
  return next();
}

exports.authorizeRoles = (role) => {
  
  return (req,res,next)=>{
    if(req.user.role !== role ){
      return next(new ErrorHandler(`Role : ${req.user.role} is not allowed to access resources`),403)
    }
    next();
  }
  
}

