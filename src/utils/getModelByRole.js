import SuperAdmin from "../models/superAdminModel.js";
import Admin from "../models/adminModel.js";
import User from "../models/userModel.js";
import AppError from "./AppError.js";

export const getModelByRole = (role) => {
    switch (role) {
        case "superAdmin":
            return SuperAdmin;
        case "admin":
            return Admin;
        case "user":
            return User;
        default:
            throw new AppError("Invalid role provided", 400);
    }
};