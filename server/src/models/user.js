import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    isMfaActive: {
        type: Boolean,
        required: false,
    },
    mfaSecret: {
        type: String,
        default: null
    },
    mfaBackupCodes: {
        type: [String],
        default: []
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: {
        type: Date,
        default: null
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    activationOtp: {
        type: String,
        default: null
    },
    activationOtpExpiry: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    passwordResetOtp: { 
        type: String, 
        default: null 
    },
    passwordResetExpiry: { 
        type: Date, 
        default: null 
    },
    lastLoginAt: { 
        type: Date, 
        default: null 
    },
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;