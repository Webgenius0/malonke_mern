import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Admin from "../models/adminModel.js";
import bcrypt from "bcrypt";


/**
 * Create Admin Controller
 */
export const createAdmin = catchAsync(async (req, res,next) => {

    const {id} = req.user;

    const {username,firstName, lastName, email, password, confirmPassword,isTermAgree} = req.body;

    // Check required fields
    if (!username || !firstName || !lastName || !email || !password || !confirmPassword || !isTermAgree) {
        return next(new AppError("First Name, Last Name, email, password, confirmPassword, and isTermAgree are required", 400));
    }

    //Check password match
    if(password !== confirmPassword) {
        return next(new AppError("Passwords do not match", 400));
    }

    // Check if email already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
        return next(new AppError("An account with this email already exists.", 409));
    }

    // Create new user in a pending state
    await Admin.create({
        username,
        firstName,
        lastName,
        email,
        password,
        isTermAgree,
        superAdminID:id
    });

    res.status(201).json({status: "success", message: "Admin Created successfully!"});
});