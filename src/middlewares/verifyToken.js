import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// Middleware to verify access token and handle refresh token
const verifyToken = catchAsync(async (req, res, next) => {
    let token = req.cookies.token;
    if(!token) {
        token = req.headers.token;
    }
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS);

    if (decoded === undefined) {
        return next(new AppError('Unauthorized access!', 401));
    }
    req.user = decoded;
    next();
});

export default verifyToken;
