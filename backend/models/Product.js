const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty']
    },
    brand: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        min: 0
    },
    comparePrice: {
        type: Number,
        min: 0
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['active', 'draft', 'archived'],
        default: 'active'
    },
    featured: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
