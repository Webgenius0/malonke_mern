import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
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
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            index: true,
            match: [/\S+@\S+\.\S+/, 'Email is invalid'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            index: true,
        },
        refreshToken: {
            type: String,
            index: true,
        },
        isTermAgree: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            default: 'user',
            index: true,
        },
    },
    { timestamps: true, versionKey: false }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add a method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('users', userSchema);
export default User;
