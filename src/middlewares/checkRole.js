import AppError from "../utils/AppError.js";

export const checkRole = (roles) => {
    return (req, res, next) => {
        try {
            console.log("req.user:", req.user); // Debugging line
            const userRole = req.user?.role;
            console.log("Allowed roles:", roles);
            console.log("User Role:", userRole);

            if (!userRole) {
                return next(new AppError("User role is missing!", 403));
            }

            if (!roles.includes(userRole)) {
                return next(new AppError("Access denied! You don't have permission to perform this action.", 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
