const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    category: { type: String, required: true, enum: ['Subscriptions', 'Templates', 'Plugins'] },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    originalPrice: { type: Number, default: null },
    image: { type: String, default: 'assets/images/placeholder.png' },
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, default: 999 },
    badge: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
