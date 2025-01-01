import mongoose from "mongoose";
import {comparePassword, preSaveHook, usernameValidation} from "../utils/commonSchemaMethods.js";


const adminSchema = new mongoose.Schema(
    {
        superAdminID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "SuperAdmin",
            required: [true,"Super Admin id is required!"],
            index: true
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            index: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            index: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            index: true,
            trim: true,
            validate: {
                validator: usernameValidation,
                message:
                    "Username must contain only lowercase letters and numbers without spaces.",
            },
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            index: true,
            match: [/\S+@\S+\.\S+/, 'Email is invalid'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            index: true,
            trim: true,
            minlength: 8,
        },
        refreshToken: {
            type: String,
            index: true,
            trim: true,
        },
        isTermAgree: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: 'admin',
            index: true,
            trim: true,
        },
    },
    { timestamps: true, versionKey: false }
);

// Apply the password hashing pre-save hook and the comparePassword method
adminSchema.pre("save", preSaveHook);
adminSchema.methods.comparePassword = comparePassword;


const Admin = mongoose.model('admins', adminSchema);
export default Admin;