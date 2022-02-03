const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/usermodel");
const req = require("express/lib/request");
const sendToken = require("../utils/jwtToken");
const { validate } = require("../models/usermodel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { send } = require("express/lib/response");

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

// FORGOT PASSWORD
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  //get resetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}:http://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `your password reset token is :- \n\n${resetPasswordUrl}\n\nIf you have not requested this Email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      sunject: `Ecommerce Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// RESET PASSWORD
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // CREATING TOKEN HASH
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("reset Password token is invalid or expired", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesnot match password", 400));
  }

  user.password = req.body.password;
  user.getResetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});
