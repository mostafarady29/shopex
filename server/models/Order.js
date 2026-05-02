const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    totalPrice: { type: Number, required: true },
    shippingAddress: {
        firstName: String, lastName: String, email: String,
        address: String, city: String, state: String, zip: String, country: String
    },
    paymentMethod: { type: String, default: 'credit_card' },
    referralCode: { type: String, default: null },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
