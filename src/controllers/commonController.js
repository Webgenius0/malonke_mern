import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import SuperAdmin from "../models/superAdminModel.js";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import {getModelByRole} from "../utils/getModelByRole.js";

// Helper function to generate access and refresh tokens
const generateAccessToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET_ACCESS, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
};

const generateRefreshToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET_REFRESH, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN});
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
    const accessToken = generateAccessToken(user._id, role);
    const refreshToken = generateRefreshToken(user._id, role);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Set access token as HTTP-only cookie
    res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: false,
        sameSite: "strict",
        maxAge: 3600 * 1000,
    });

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Remove sensitive data from the response
    const { password: _, refreshToken: __, ...userData } = user.toObject();

    // Send response
    res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        user: userData,
        accessToken,
        refreshToken
    });
});



/**
 * Refresh Token Controller
 */
export const refreshAccessToken = catchAsync(async (req, res,next) => {
    const { accessToken, newRefreshToken } = await refreshAccessTokenService(req,next);

    // Set access token as HTTP-only cookie
    res.cookie("accessToken", accessToken, {
        httpOnly: false,
        secure: false,
        sameSite: "strict",
        maxAge: 3600 * 1000,
    });

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({status: "success",data:{accessToken:accessToken, refreshToken:newRefreshToken}});
});


/**
 * Refresh Token Service
 */
const refreshAccessTokenService = async (req, next) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        next(new AppError("Unauthorized request", 401));
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET_REFRESH);

        const user = await User.findById(decodedToken.id);
        if (!user) {
            next(new AppError("Unauthorized request", 401));
        }

        if (incomingRefreshToken !== user.refreshToken) {
            next(new AppError("Refresh token expired", 401));
        }

        // Generate new access and refresh tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id, user.role);

        // Save new refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, newRefreshToken: refreshToken };
    } catch (error) {
        next(new AppError("Invalid refresh token", 401));
    }
};



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
