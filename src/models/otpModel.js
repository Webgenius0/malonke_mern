import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        index: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        default: null,
        index: true,
        trim: true,
    },
    otpExpire: {
        type: Date,
        default: null,
    },
    otpVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
