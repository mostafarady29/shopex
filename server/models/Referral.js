const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    affiliateUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    code: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    commission: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'converted', 'paid'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', referralSchema);
