// utils/commonSchemaUtils.js

import bcrypt from 'bcrypt';

// Common pre-save hook to hash passwords
export const preSaveHook = async function (next) {
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
};

// Method to compare passwords
export const comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


// Common username validation
export const usernameValidation = (value) => /^[a-z0-9]+$/.test(value);
