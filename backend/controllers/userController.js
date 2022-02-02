const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/usermodel");
const req = require("express/lib/request");
const sendToken = require("../utils/jwtToken");

//Register the user

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample Id",
      url: "Profile pic URL",
    },
  });

  sendToken(user, 201, res);

  //Before using the above function below code was in use
  //   const token = user.getJWTToken();
  //   res.status(201).json({
  //     success: true,
  //     token,
  //   });
});

//Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //checking if the user has the password and email both
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("INVAILD!! Email and Password", 401));
  }

  const isPasswordMatched = user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("INVAILD!! Email and Password", 401));
  }

  sendToken(user, 200, res);

  //Before using the above function below code was in use
  //   const token = user.getJWTToken();
  //   res.status(200).json({
  //     success: true,
  //     token,
  //   });
});

//Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged OUT",
  });
});
