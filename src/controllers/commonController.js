import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import {getModelByRole} from "../utils/getModelByRole.js";
import crypto from 'crypto';
import OTP from "../models/otpModel.js";
import {emailUtility} from "../utils/emailUtility.js";


// Helper function to generate access and refresh tokens
const generateAccessToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET_ACCESS, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
};


/**
 * Login Controller
 */
export const login = catchAsync(async (req, res, next) => {
    const { identifier, password, role } = req.body;

    // Validate input
    if (!identifier || !password || !role) {
        return next(new AppError("Identifier, password, and role are required", 400));
    }


    // Get model based on role
    let Model;
    try {
        Model = await getModelByRole(role);
    } catch (err) {
        return next(err);
    }

    // Find user by email or username
    const user = await Model.findOne({$or: [{ email: identifier }, { username: identifier }]}).select("+password +refreshToken");


    if (!user) {
        return next(new AppError(`No user found with the provided identifier: ${identifier}`, 401));
    }

    // Validate the current password (compare plain text password with stored hash)
    const isPasswordCorrect = await bcrypt.compare(password.trim(), user.password);
    console.log(isPasswordCorrect);
    console.log('Provided password (plain text):', password);
    console.log('Stored hashed password:', user.password);

    if (!isPasswordCorrect) {
        return next(new AppError("Incorrect current password", 401));
    }

    // Generate access and refresh tokens
    const token = generateAccessToken(user._id, role);
    await user.save();

    // Set access token as HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 3600 * 1000,
    });

    // Remove sensitive data from the response
    const { password: _, refreshToken: __, ...userData } = user.toObject();

    // Send response
    res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        user: userData,
        token
    });
});



// /**
//  * Refresh Token Controller
//  */
// export const refreshAccessToken = catchAsync(async (req, res,next) => {
//     const { accessToken, newRefreshToken } = await refreshAccessTokenService(req,next);
//
//     // Set access token as HTTP-only cookie
//     res.cookie("accessToken", accessToken, {
//         httpOnly: false,
//         secure: false,
//         sameSite: "strict",
//         maxAge: 3600 * 1000,
//     });
//
//     // Set refresh token as HTTP-only cookie
//     res.cookie("refreshToken", newRefreshToken, {
//         httpOnly: false,
//         secure: false,
//         sameSite: "strict",
//         maxAge: 30 * 24 * 60 * 60 * 1000,
//     });
//
//     return res.status(200).json({status: "success",data:{accessToken:accessToken, refreshToken:newRefreshToken}});
// });
//
//
// /**
//  * Refresh Token Service
//  */
// const refreshAccessTokenService = async (req, next) => {
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
//
//     if (!incomingRefreshToken) {
//         next(new AppError("Unauthorized request", 401));
//     }
//
//     try {
//         const decodedToken = jwt.verify(incomingRefreshToken, process..env.JWT_SECRET_REFRESH);
//
//         const user = await User.findById(decodedToken.id);
//         if (!user) {
//             next(new AppError("Unauthorized request", 401));
//         }
//
//         if (incomingRefreshToken !== user.refreshToken) {
//             next(new AppError("Refresh token expired", 401));
//         }
//
//         // Generate new access and refresh tokens
//         const accessToken = generateAccessToken(user._id, user.role);
//         const refreshToken = generateRefreshToken(user._id, user.role);
//
//         // Save new refresh token in DB
//         user.refreshToken = refreshToken;
//         await user.save();
//
//         return { accessToken, newRefreshToken: refreshToken };
//     } catch (error) {
//         next(new AppError("Invalid refresh token", 401));
//     }
// };



/**
 * Change Password Controller
 */
export const changePassword = catchAsync(async (req, res, next) => {
    const { id, role } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new AppError("All fields (oldPassword, newPassword, confirmPassword) are required.", 400));
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
        return next(new AppError("New password and confirm password do not match.", 400));
    }

    // Get model based on role
    let Model;
    try {
        Model = await getModelByRole(role);
    } catch (err) {
        return next(err);
    }

    // Fetch user by ID
    const user = await Model.findById(id);
    if (!user) {
        return next(new AppError("User does not exist.", 404));
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return next(new AppError("Old password is incorrect.", 401));
    }

    // Hash new password and update
    user.password = newPassword;
    await user.save();

    // Success response
    res.status(200).json({
        success: true,
        message: "Password changed successfully.",
    });
});


/**
 * Check for Role
 */

export const checkForRole = catchAsync(async (req, res, next) => {
    const role  = req.params.role;
    let Model;
    try {
        Model = await getModelByRole(role);
    } catch (err) {
        return next(new AppError('Error getting model by role', 500));
    }

    const isValid = await Model.findOne({ role });

    if (!isValid) {
        return next(new AppError("User does not exist!", 404));
    }

    res.status(200).json({ status: true, role:isValid.role });
});

/**
 * Password reset request
 */
export const requestPasswordReset = catchAsync(async (req, res, next) => {
    const {email,role} = req.body;
    let Model;

    try {
        Model = await getModelByRole(role);
    } catch (err) {
        return next(new AppError('Role not found or error fetching model', 500));
    }

    const user = await Model.findOne({ email });
    if (!user) {
        return next(new AppError("User does not exist!", 404));
    }

    const otp = crypto.randomBytes(3).toString('hex');
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 60);

    let otpRecord = await OTP.findOne({ email });

    if (otpRecord) {
        if (new Date() > otpRecord.otpExpire) {
            otpRecord.otp = otp;
            otpRecord.otpExpire = otpExpire;
            otpRecord.otpVerified = false;
        } else {
            return res.status(400).json({ message: 'OTP already sent. Please check your email.' });
        }
    } else {
        otpRecord = new OTP({
            email,
            otp,
            otpExpire,
        });
    }

    const options = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP Verification Code to Complete Your Reset Password Request!",
        html: `<html>
          <head>
          <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; padding-bottom: 20px; }
          .header h1 { font-size: 24px; color: #333; }
          .content { font-size: 16px; color: #555; line-height: 1.6; }
          .important { color: #d9534f; font-weight: bold; }
          .link-button { display: inline-block; padding: 12px 20px; background-color: #29ABE2; border-radius: 4px; font-size: 16px; margin-top: 20px; }
          .link-button:hover { background-color: #255A87; }
          .footer { text-align: center; font-size: 14px; color: #888; margin-top: 20px; }
          .footer p { margin: 0; font-weight:500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Invitation to Complete Your Registration</h1>
          </div>
          <div class="content">
            <p>Hello there,</p>
            <p>We received a request to reset your password. Please use the OTP code below to verify and complete your reset password request.</p>
            <p>Your OTP verification code is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 1 hour. If you did not initiate this request, please ignore this email.</p>
            <p class="important">Important: Please don't share this verification code with anyone else.</p>
          </div>
          <div class="footer">
            <p>Thank you,</p>
            <p>The Malonke Team</p>
          </div>
        </div>
      </body>
    </html>`,
    };

    try {
        await emailUtility(options);
        await otpRecord.save();
        res.status(200).json({ message: 'OTP sent to your email.' });
    } catch (error) {
        return next(new AppError('Error sending OTP email. Please try again.', 500));
    }
});


/**
 * Verify Otp
 */
export const verifyOTP = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
        return next(new AppError("OTP not found for this email", 400));
    }

    if (otpRecord.otpVerified) {
        return next(new AppError("OTP has already been verified", 400));
    }

    if (new Date() > otpRecord.otpExpire) {
        return next(new AppError("OTP has expired, please request a new one", 400));
    }

    if (otpRecord.otp !== otp) {
        return next(new AppError("Invalid OTP", 400));
    }

    otpRecord.otpVerified = true;
    await otpRecord.save();

    res.status(200).json({ message: "OTP verified successfully" });
});


/**
 * Reset Password
 */
export const resetPassword = catchAsync(async (req, res, next) => {
    const { email, newPassword,role } = req.body;

    let Model;

    try {
        Model = await getModelByRole(role);
    } catch (err) {
        return next(new AppError('Error getting model by role', 500));
    }

    // Step 1: Find user by email
    const user = await Model.findOne({ email });
    if (!user) {
        return next(new AppError("User not found!", 404));
    }

    // Step 2: Find OTP record for the email
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
        return next(new AppError("No OTP found for this email. Please request a new OTP.", 400));
    }

    // Step 3: Check if OTP is already verified
    if (otpRecord.otpVerified) {
        return next(new AppError("OTP has already been verified", 400));
    }

    // Step 4: Check if OTP is expired
    if (new Date() > otpRecord.otpExpire) {
        return next(new AppError("OTP has expired, please request a new one.", 400));
    }

    // Step 5: Validate the OTP entered by the user
    if (otpRecord.otp !== otp) {
        return next(new AppError("Invalid OTP", 400));
    }

    user.password = newPassword;
    await user.save();

    // Remove OTP record after password reset
    await OTP.findOneAndDelete({ email });

    res.status(200).json({ message: "Password reset successfully" });
});
