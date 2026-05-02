const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['user', 'affiliate', 'moderator', 'admin'], default: 'user' },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Generate referral code on creation
userSchema.pre('save', function (next) {
    if (!this.referralCode) {
        this.referralCode = this.name.split(' ')[0].toUpperCase() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    next();
});

// Match password
userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

// Sign JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

module.exports = mongoose.model('User', userSchema);
