import AppError from "../utils/AppError.js";

// Middleware to check user role
export const checkRole = (roles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user.role;
            console.log(`User Role: ${userRole}`);

            // Check if the user's role is included in the allowed roles
            if (!roles.includes(userRole)) {
                return next(
                    new AppError("Access denied! You don't have permission to perform this action.", 403)
                );
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
