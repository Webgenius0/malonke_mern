import mongoose from "mongoose";
import validator from "validator";

const otpSchema = new mongoose.Schema(
    {
        otp: {
            type: String,
            required: [true, "OTP is required!"],
            index: true,
        },
        userID: {
            type: mongoose.Types.ObjectId,
            required: [true, "UserID is required!"],
        },
        email: {
            type: String,
            required: [true, "Email is required!"],
            validate: [validator.isEmail, "Invalid email format!"],
            index: true,
        },
        purpose: {
            type: String,
            required: [true, "OTP purpose is required!"],
            index: true,
            enum: ["registration", "forgotPassword"],
        },
        isUsed: {
            type: Boolean,
            required: [true, "isUsed is required!"],
            default: false,
        },
        expiresIn: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

// Middleware to set expiration time automatically (15 minutes from creation)
otpSchema.pre("save", function (next) {
    if (!this.expiresIn) {
        this.expiresIn = new Date(Date.now() + 15 * 60 * 1000);
    }
    next();
});

// Compound index for unique OTP per email and purpose
otpSchema.index({ email: 1, otp: 1, purpose: 1, isUsed: 1 }, { unique: true });

const Otp = mongoose.model("otps", otpSchema);
export default Otp;
