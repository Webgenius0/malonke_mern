import mongoose from "mongoose";
import {comparePassword,  preSaveHook, usernameValidation} from "../utils/commonSchemaMethods.js";


const superAdminSchema = new mongoose.Schema(
    {
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
        role: {
            type: String,
            default: 'superAdmin',
            index: true,
            trim: true,
        },
    },
    { timestamps: true, versionKey: false }
);

// Apply the password hashing pre-save hook and the comparePassword method
superAdminSchema.pre("save", preSaveHook);
superAdminSchema.methods.comparePassword = comparePassword;


const SuperAdmin = mongoose.model("superadmins", superAdminSchema);
export default SuperAdmin;