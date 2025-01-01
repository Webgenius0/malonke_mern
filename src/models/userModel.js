import mongoose from 'mongoose';
import {comparePassword, preSaveHook, usernameValidation} from "../utils/commonSchemaMethods.js";

const userSchema = new mongoose.Schema(
    {
        superAdminID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "SuperAdmin",
            required: [true,"Super Admin id is required!"],
            index: true
        },
        adminID:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: [true,"Admin id is required!"],
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
        viewOnly:{type:Boolean,default:true},
        refreshToken: {
            type: String,
            index: true,
            trim: true,
        },
        isNdaAgree: {
            type: Boolean,
            default: false,
        },
        agreedAt:{
            type: Date,
            default: Date.now,
        },
        role: {
            type: String,
            default: 'user',
            index: true,
            trim: true,
        },
    },
    { timestamps: true, versionKey: false }
);


// Apply the password hashing pre-save hook and the comparePassword method
userSchema.pre("save", preSaveHook);
userSchema.methods.comparePassword = comparePassword;


const User = mongoose.model('users', userSchema);
export default User;
