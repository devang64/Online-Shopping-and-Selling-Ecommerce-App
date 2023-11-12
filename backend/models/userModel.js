const mongoose = require("mongoose");
const { validator, isEmail } = require("validator");
const bycrypt = require('bcryptjs');



const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "name cannot exceed 30 character"],
    minLength: [4, "name should have more than 4 character"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [isEmail, "Please Enter a Valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your password"],
    minLength: [7, "Password should be greater than 8 character"],
    select: false, // means when we call schema password field is not given by mongodb because select is false
  },
  avatar: {
    public_id: {
      type: String,
     
    },
    url: {
      type: String,
     
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bycrypt.hash(this.password, 10);
  next();
});


module.exports = mongoose.model("User", userSchema);
