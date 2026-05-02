const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

// GET /api/wishlist - Get user's wishlist
router.get('/', protect, async (req, res, next) => {
    try {
        const items = await prisma.wishlistItem.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        comparePrice: true,
                        images: true,
                        rating: true,
                        reviewCount: true,
                        brand: true,
                        stock: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, items });
    } catch (err) {
        next(err);
    }
});

// POST /api/wishlist - Add item to wishlist (toggle)
router.post('/', protect, async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required' });
        }

        // Check if already in wishlist → toggle (remove)
        const existing = await prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId: req.user.id, productId } }
        });

        if (existing) {
            await prisma.wishlistItem.delete({ where: { id: existing.id } });
            return res.json({ success: true, action: 'removed', message: 'Removed from wishlist' });
        }

        // Add to wishlist
        const item = await prisma.wishlistItem.create({
            data: { userId: req.user.id, productId },
            include: { product: true }
        });

        res.json({ success: true, action: 'added', item });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/wishlist/:id - Remove from wishlist
router.delete('/:id', protect, async (req, res, next) => {
    try {
        await prisma.wishlistItem.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        next(err);
    }
});

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', protect, async (req, res, next) => {
    try {
        const item = await prisma.wishlistItem.findUnique({
            where: { userId_productId: { userId: req.user.id, productId: req.params.productId } }
        });
        res.json({ success: true, inWishlist: !!item });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
