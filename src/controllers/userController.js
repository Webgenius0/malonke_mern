import User from "../models/userModel.js";
import Otp from "../models/otpModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import {emailUtility} from "../utils/emailUtility.js";


export const registration = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    isTermAgree,
    role,
  } = req.body;

  // Check required fields
  if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      isTermAgree === undefined
  ) {
    return next(
        new AppError(
            "First Name, Last Name, email, password, confirmPassword, and isTermAgree are required",
            400
        )
    );
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }



// Validate password strength using regex
  const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(new AppError("Password must be at least 8 characters long and include at least uppercase English letter,lowercase English letter, one number," +
        "and one special character.", 400));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
        new AppError("An account with this email already exists.", 409)
    );
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user in a pending state
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    refreshToken: "",
    isTermAgree,
    role: role || "user",
  });

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiration = new Date(Date.now() + 15 * 60 * 1000);

  // Save OTP in the database
  await Otp.create({
    otp,
    userID: newUser._id,
    email,
    purpose: "registration",
    isUsed: false,
    expiresIn: otpExpiration,
  });

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration Verification",
    text: `Dear ${firstName},
    We received a request to register your account. Please use the OTP below to verify your email address and complete your registration:
    OTP: ${otp}
    This OTP is valid for 15 minutes. If you did not initiate this request, please ignore this email.

    Thank you,
    The Malonke Team`,
    html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
            <h2 style="color: #4CAF50;">Verify Your Email</h2>
            <p>Dear ${firstName},</p>
            <p>We received a request to register your account. Please use the OTP below to verify your email address and complete your registration:</p>
            <div style="margin: 20px 0; font-size: 20px; font-weight: bold; color: #4CAF50;">${otp}</div>
            <p>This OTP is valid for 10 minutes. If you did not initiate this request, please ignore this email.</p>
            <p>Thank you,</p>
            <p>The Malonke Team</p>
        </div>
    `,
  };

  // Send OTP email
  await emailUtility(mailOptions,next);

  res.status(201).json({
    status: "success",
    message: "User registered successfully! Please verify your email with the OTP sent.",
    data: {
      id: newUser._id,
      email: newUser.email,
    },
  });
});

// Verify OTP Endpoint
export const verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // Validate and sanitize input fields
  if (!email || !otp) {
    return next(new AppError("Email and OTP are required!", 400));
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedOtp = otp.trim();

  // Find the OTP
  const validOtp = await Otp.findOne({
    email: sanitizedEmail,
    otp: sanitizedOtp,
    purpose: "registration",
    isUsed: false,
  });

  if (!validOtp) {
    return next(new AppError("Invalid OTP!", 400));
  }

  if (validOtp.expiresIn < new Date()) {
    return next(new AppError("OTP has expired!", 400));
  }

  // Mark OTP as used and nullify its value for security
  validOtp.isUsed = true;
  validOtp.otp = null;
  await validOtp.save();

  // Activate the user
  const user = await User.findOneAndUpdate(
      { email: sanitizedEmail },
      { isActive: true },
      { new: true }
  );

  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "OTP verified successfully! Registration completed.",
    data: {
      id: user._id,
      email: user.email,
    },
  });
});
