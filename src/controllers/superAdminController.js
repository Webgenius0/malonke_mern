import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import SuperAdmin from "../models/superAdminModel.js";

export const createSuperAdmin = catchAsync(async (req, res, next) => {
    const { username, firstName, lastName, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!username || !firstName || !lastName || !email || !password || !confirmPassword) {
        return next(new AppError("Username, First Name, Last Name, email, password, and confirmPassword are required", 400));
    }

    // Check password match
    if (password !== confirmPassword) {
        return next(new AppError("Passwords do not match", 400));
    }

    // Check if a super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne();
    if (existingSuperAdmin) {
        return next(new AppError("There can only be one Super Admin. A Super Admin already exists.", 409));
    }

    // Check if email already exists for regular users
    const existingUser = await SuperAdmin.findOne({ email });
    if (existingUser) {
        return next(new AppError("An account with this email already exists.", 409));
    }

    // Create the super admin
    await SuperAdmin.create({
        username,
        firstName,
        lastName,
        email,
        password,
        role: "superAdmin",
    });

    // Return response with the created user's details (excluding sensitive data)
    res.status(201).json({ status: "success", message: "Super Admin Created Successfully!" });
});
