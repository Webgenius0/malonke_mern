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

dotenv.config(); // Load environment variables

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
    origin: process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:5173",
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
            message: "Welcome to Malonke backend!",
        },
    });
});

//Other Routes
app.use("/api/v1/users", userRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(err.statusCode || 500).json({
        status: err.status || "error",
        message: err.message || "An unexpected error occurred",
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
