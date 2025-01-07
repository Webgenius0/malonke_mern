import express from "express";
import cors from "cors";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
import AppError from "./src/utils/AppError.js";
import userRoutes from "./src/routes/userRoutes.js";
import connectDB from "./src/db/connectDB.js";
import superAdminRoutes from "./src/routes/superAdminRoutes.js";
import commonRoutes from "./src/routes/commonRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

dotenv.config();

const app = express();


// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(morgan("dev"));
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);
app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        data: {
            message: "Welcome to Malonke",
        },
    });
});

//Other Routes
app.use("/api/v1/superAdmin",superAdminRoutes);
app.use("/api/v1/admin",adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/common", commonRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

//Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || "An unexpected error occurred, please try again later.";
    const userMessage = err.userMessage || message;
    res.status(statusCode).json({
        status: statusCode === 500 ? "error" : err.status || "success",
        message: userMessage,
    });
});

// Connect to MongoDB
connectDB();

// Graceful shutdown handling
process.on("SIGINT", () => {
    console.log("Server shutting down...");
    process.exit(0);
});

export default app;
