const generateToken = require('./generateToken');

const sendToken = (user, statuscode, res) => {
  const token = generateToken(user._id);
  const options = {
    expiresIn: process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000, // Convert days to milliseconds
    httpOnly: true,
  };
  res
    .status(statuscode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user,
      message: "Login successful",
    });
};


module.exports = sendToken;