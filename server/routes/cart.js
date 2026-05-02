const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

// GET /api/cart - Get user's cart
router.get('/', protect, async (req, res, next) => {
    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        comparePrice: true,
                        images: true,
                        stock: true,
                        brand: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, cartItems });
    } catch (err) {
        next(err);
    }
});

// POST /api/cart - Add item to cart (or increment quantity)
router.post('/', protect, async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required' });
        }

        // Check product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Upsert - add or update quantity
        const cartItem = await prisma.cartItem.upsert({
            where: {
                userId_productId: { userId: req.user.id, productId }
            },
            update: {
                quantity: { increment: quantity }
            },
            create: {
                userId: req.user.id,
                productId,
                quantity
            },
            include: { product: true }
        });

        // Get total cart count
        const cartCount = await prisma.cartItem.aggregate({
            where: { userId: req.user.id },
            _sum: { quantity: true }
        });

        res.json({ success: true, cartItem, cartCount: cartCount._sum.quantity || 0 });
    } catch (err) {
        next(err);
    }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const cartItem = await prisma.cartItem.update({
            where: { id: req.params.id },
            data: { quantity },
            include: { product: true }
        });

        res.json({ success: true, cartItem });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        next(err);
    }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', protect, async (req, res, next) => {
    try {
        await prisma.cartItem.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        next(err);
    }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', protect, async (req, res, next) => {
    try {
        await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        next(err);
    }
});

// GET /api/cart/count - Get cart item count
router.get('/count', protect, async (req, res, next) => {
    try {
        const result = await prisma.cartItem.aggregate({
            where: { userId: req.user.id },
            _sum: { quantity: true }
        });
        res.json({ success: true, count: result._sum.quantity || 0 });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
