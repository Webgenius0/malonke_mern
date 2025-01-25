import User from "../models/userModel.js";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { emailUtility } from "../utils/emailUtility.js";
import MagicLink from "../models/magicLinkModel.js";
import Admin from "../models/adminModel.js";
/**
 * Generate and Send Magic Link
 */
export const sendInviteLink = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { email } = req.body;

  if (!email) return next(new AppError("Email is required!", 400));

  const token = crypto.randomBytes(32).toString("hex");
  const expiration = Date.now() + 2 * 24 * 60 * 60 * 1000;

  const magicLink = `https://malonke.netlify.app/verify?token=${token}&email=${email}`;

  const options = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Invitation Link to Complete Your Registration!",
    html: `<html>
          <head>
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            color: #333;
          }
          .content {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
          }
          .important {
            color: #d9534f;
            font-weight: bold;
          }
          .link-button {
            display: inline-block;
            padding: 12px 20px;
            background-color: #29ABE2;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 20px;
          }
          
          .link-button:hover {
          background-color: #255A87;
          }
          
          .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            margin-top: 20px;
          }
          .footer p {
            margin: 0;
            font-weight:500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invitation to Complete Your Registration</h1>
          </div>
          <div class="content">
            <p>Hello there,</p>
            <p>We received a request to register your account. Please click the link below to verify your email address and complete your registration:</p>
            <p><a href="${magicLink}" class="link-button" style="color: white;font-weight: 500 ; text-decoration: none;">Verify Your Email</a></p>
            <p>This link is valid for 2 days. If you did not initiate this request, please ignore this email.</p>
            <p class="important">Important: Please don't delete and share this verification link with anyone else, 
             as you will need it to complete the registration process. Once you click the link, you will be redirected
             to our platform where you can finish your registration.</p>
          </div>
          <div class="footer">
            <p>Thank you,</p>
            <p>The Malonke Team</p>
          </div>
        </div>
      </body>
    </html>`,
  };

  // Check if the magic link already exists
  const existingMagicLink = await MagicLink.findOne({ email });

  if (existingMagicLink) {
    existingMagicLink.magicLink = magicLink;
    existingMagicLink.isUsed = false;
    existingMagicLink.adminID = id;
    existingMagicLink.expiresAt = new Date(expiration);
    await existingMagicLink.save();
  } else {
    await MagicLink.create({
      email,
      magicLink,
      adminID: id,
      expiresAt: new Date(expiration),
    });
  }

  // Send the email for both cases
  await emailUtility(options, next);

  res.status(200).json({
    success: true,
    message: "Invitation link sent to the provided email.",
  });
});

/**
 * Verify Magic Link
 */
export const verifyMagicLink = catchAsync(async (req, res, next) => {
  const { email, magicLink } = req.body;

  if (!email || !magicLink) {
    return next(new AppError("Email and Magic Link are required!", 400));
  }

  const isValid = await MagicLink.findOne({ email });

  if (isValid.expiresAt < Date.now()) {
    return next(new AppError("Magic Link has expired!", 400));
  }

  if (isValid.isUsed) {
    return next(new AppError("This link has already been used.", 400));
  }

  isValid.isUsed = true;
  await isValid.save();

  res.status(200).json({
    status: "success",
    message: "Successfully verified",
    data: { adminID: isValid.adminID, isUsed: isValid.isUsed },
  });
});

/**
 * Check if link is verified
 */

export const isUserVerified = catchAsync(async (req, res, next) => {
  const { email } = req.params;

  // Validate if email exists in request parameters
  if (!email) {
    return next(new AppError("Email is invalid!", 400));
  }

  // Check if a magic link exists and has been used
  const isVerified = await MagicLink.findOne({ email, isUsed: true });

  // If no matching magic link or isUsed is false, deny access
  if (!isVerified) {
    return next(new AppError("Forbidden! Verification required.", 403));
  }

  // Exclude sensitive fields (like magicLink) before responding
  const { magicLink: _, email: __, ...userData } = isVerified.toObject();

  // Respond with success and user data
  return res.status(200).json({
    status: "success",
    data: userData,
  });
});

/**
 * User Registration
 */
export const createUser = catchAsync(async (req, res, next) => {
  const {
    adminID,
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword,
    isNdaAgree,
  } = req.body;

  // Check if the user already exists (based on email or username)
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    return next(new AppError("Email already in use", 400));
  }

  const existingUserByUsername = await User.findOne({ username });
  if (existingUserByUsername) {
    return next(new AppError("Username already in use", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  if (!isNdaAgree) {
    return next(new AppError("User must need to agree NDA!", 400));
  }

  // Validate adminID
  const admin = await Admin.findById(adminID);
  console.log(admin);
  if (!admin) {
    return next(new AppError("Invalid Admin ID provided", 400));
  }

  // Create a new user object
  const newUser = new User({
    superAdminID: admin.superAdminID,
    adminID,
    firstName,
    lastName,
    username,
    email,
    password,
    isNdaAgree,
  });

  await newUser.save();

  // Respond with success message
  res.status(201).json({
    status: "success",
    message: "User created successfully",
  });
});

// Get all user controller
export const getAllusers = async (req, res) => {
  try {
    const AllUsers = await User.find();

    if (!AllUsers) {
      return res.status(404).json({ message: "No user found" });
    }

    // Get admins with avatars using aggregations $lookup
    const usersWithAvatars = await User.aggregate([
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "userID",
          as: "profile",
        },
      },
      {
        $unwind: "$profile",
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          username: 1,
          email: 1,
          profile: {
            avatar: "$profile.avatar",
          },
        },
      },
    ]);

    return res.status(200).json({
      status: "success",
      message: "All user retrieved successfully",
      data: usersWithAvatars,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
