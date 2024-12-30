import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

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

  // Validate password strength
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return next(
      new AppError(
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.",
        400
      )
    );
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

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    refreshToken: "",
    isTermAgree,
    role: role || "user",
  });

  // Send success response
  res.status(201).json({
    status: "success",
    message: "User registered successfully!",
    data: {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});
