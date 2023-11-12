const User = require("../models/userModel");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendToken = require("../utils/sendToken");
const nodemailer = require('nodemailer')
const EroorHandler = require("../utils/errorHandler.js");

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
  

    });
    res.status(200).json({
      success: true,
      user

    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

//login user

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new EroorHandler("Please Enter valid Credentials", 400));
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new EroorHandler("Invalid Email & Password", 401));
    }

    // Compare the provided password with the hashed password
    const passwordCompare = await bcrypt.compare(password, user.password);

    if (passwordCompare) {
      await sendToken(user, 200, res);
    } else {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return next(new EroorHandler("Internal server error", 500));
  }
};

exports.logoutUser = async (req, res, next) => {
  const token = req.cookies.token; // Retrieve the token from the cookie

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
}

//reset password token 

exports.resetPasswordToken = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token expiration time (e.g., 1 hour)
    const tokenExpiration = Date.now() + 3600000; // 1 hour

    // Store the token and expiration time in the user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = tokenExpiration;

    await user.save();
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;


    // Send the reset token to the user's email using Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      service: process.env.SMPT_SERVICE,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'devangpatel6445@gmail.com',
        pass: 'hgxxmyppbwtankgf'
      },
    });

    const mailOptions = {
      from: 'devangpatel6445@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: message,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.json({ message: 'Reset password token sent to your email' });
  } catch (error) {
    console.error('Error generating reset token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
//reset password
exports.resetPassword = async (req, res, next) => {
  const { token, newPassword, newConfirmPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (req.body.newPassword !== req.body.newConfirmPassword) {
      return next(new EroorHandler("Password does not match", 400));
    }
    // Set the new password and clear the reset token fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    console.log(user)

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get User Detail
exports.getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
};

// update User password
exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password);

  if (!isPasswordMatched) {
    return next(new EroorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new EroorHandler("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
};

// update User Profile
exports.updateProfile = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
};

//get all user admin
exports.getAllUser = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
};

// Get single user (admin)
exports.getSingleUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new EroorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
};

// update User Role -- Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete User --Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndRemove(req.params.id);

  if (!deletedUser) {
    return next(
      new EroorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
  } catch (error) {
    console.log(err)
    res.status(400).json({
      success : fail,
      message : error.message
    })
  }
  
};