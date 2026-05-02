const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    shippingAddress: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['card', 'paypal', 'cod']
    },
    subtotal: {
        type: Number,
        required: true
    },
    shipping: {
        type: Number,
        required: true,
        default: 0
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipping', 'completed', 'cancelled'],
        default: 'pending'
    },
    deliveryDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments();
        this.orderId = `ORD-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
