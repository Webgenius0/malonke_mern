import express from "express";
import cors from "cors";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import AppError from "./src/utils/AppError.js";
import userRoutes from "./src/routes/userRoutes.js";
import connectDB from "./src/db/connectDB.js";
import superAdminRoutes from "./src/routes/superAdminRoutes.js";
import commonRoutes from "./src/routes/commonRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import featurePlanRoutes from "./src/routes/featurePlanRoutes.js"
import profileRoutes from "./src/routes/profileRoutes.js";
import faqRoutes from "./src/routes/FAQRoutes.js";
import articleRoutes from "./src/routes/articleRoutes.js"
import keyFeatureRoutes from "./src/routes/keyFeatureRoutes.js";
import teamRoutes from "./src/routes/teamRoutes.js";
import packageRoutes from "./src/routes/packageRoutes.js";
import userContactRoutes from "./src/routes/userContactRoutes.js";
import adminContactRoutes from "./src/routes/adminContactRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";

dotenv.config();

const app = express();


// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware

app.use(morgan("dev"));
app.use(cors({
    origin:"*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json({limit:"50Mb"}));
app.use(express.urlencoded({ limit:"50Mb",extended: true }));
app.use(hpp());
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);
app.use(cookieParser());
app.use(fileUpload());

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
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/faqs", faqRoutes);
app.use("/api/v1/user", userContactRoutes);
app.use("/api/v1/admin", adminContactRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/features", featurePlanRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/keyFeatures", keyFeatureRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/package", packageRoutes);
app.use("/api/v1/external", contactRoutes);

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
