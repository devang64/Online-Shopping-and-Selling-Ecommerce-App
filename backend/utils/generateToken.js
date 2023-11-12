const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config();

const generateToken = (user_id) =>{
    const token = jwt.sign(
        { user_id: user_id },
        process.env.JWT_SECRETKEY,
        {
          expiresIn: process.env.JWT_EXPIRE,
        }
      );
      return token;
}

module.exports = generateToken;