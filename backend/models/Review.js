const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide rating'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please provide review comment']
    }
}, {
    timestamps: true
});

// Update product rating when review is added
reviewSchema.post('save', async function () {
    const Review = this.constructor;
    const Product = mongoose.model('Product');

    const stats = await Review.aggregate([
        { $match: { product: this.product } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(this.product, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count
        });
    }
});

module.exports = mongoose.model('Review', reviewSchema);
