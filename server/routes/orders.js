const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');

// POST /api/orders - Create new order
router.post('/', protect, async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod, referralCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in order' });
        }

        // Calculate totals
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
            }
            const qty = item.quantity || 1;
            subtotal += product.price * qty;
            orderItems.push({
                productId: product.id,
                name: product.name,
                quantity: qty,
                price: product.price
            });
        }

        const shipping = subtotal > 100 ? 0 : 10;
        const tax = subtotal * 0.14; // 14% tax
        const total = subtotal + shipping + tax;

        const orderId = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        const order = await prisma.order.create({
            data: {
                orderId,
                userId: req.user.id,
                shipFirstName: shippingAddress?.firstName || '',
                shipLastName: shippingAddress?.lastName || '',
                shipEmail: shippingAddress?.email || '',
                shipPhone: shippingAddress?.phone || '',
                shipStreet: shippingAddress?.address || shippingAddress?.street || '',
                shipCity: shippingAddress?.city || '',
                shipPostalCode: shippingAddress?.zip || shippingAddress?.postalCode || '',
                shipCountry: shippingAddress?.country || '',
                paymentMethod: paymentMethod || 'credit_card',
                subtotal,
                shipping,
                tax,
                total,
                items: {
                    create: orderItems
                }
            },
            include: { items: true }
        });

        // Process referral if code provided
        if (referralCode) {
            // Find the affiliate user who owns this code
            const affiliateReferrals = await prisma.referral.findMany({
                where: { code: referralCode },
                select: { affiliateUserId: true }
            });
            const affiliateUserId = affiliateReferrals[0]?.affiliateUserId;

            if (affiliateUserId && affiliateUserId !== req.user.id) {
                await prisma.referral.create({
                    data: {
                        affiliateUserId,
                        referredUserId: req.user.id,
                        code: referralCode,
                        orderId: order.id,
                        commission: total * 0.1, // 10% commission
                        status: 'converted'
                    }
                });
            }
        }

        res.status(201).json({ success: true, order });
    } catch (err) {
        next(err);
    }
});

// GET /api/orders/my - Get current user's orders
router.get('/my', protect, async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, orders });
    } catch (err) {
        next(err);
    }
});

// GET /api/orders/:id - Get single order
router.get('/:id', protect, async (req, res, next) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: { items: { include: { product: true } } }
        });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        // Only owner or admin can view
        if (order.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.json({ success: true, order });
    } catch (err) {
        next(err);
    }
});

// GET /api/orders - Get all orders (admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, orders });
    } catch (err) {
        next(err);
    }
});

// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', protect, authorize('admin'), async (req, res, next) => {
    try {
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status: req.body.status }
        });
        res.json({ success: true, order });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        next(err);
    }
});

module.exports = router;
