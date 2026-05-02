const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin', 'moderator'));

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res, next) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalProducts = await prisma.product.count();
        const totalOrders = await prisma.order.count();

        const revenueResult = await prisma.order.aggregate({
            where: { status: { not: 'cancelled' } },
            _sum: { total: true }
        });
        const totalRevenue = revenueResult._sum.total || 0;

        const totalReferrals = await prisma.referral.count();

        const commissionResult = await prisma.referral.aggregate({
            where: { status: { in: ['converted', 'paid'] } },
            _sum: { commission: true }
        });
        const totalCommissions = commissionResult._sum.commission || 0;

        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers,
                totalReferrals,
                totalCommissions
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/analytics - Dashboard analytics (KPIs, Charts, Top Products)
router.get('/analytics', async (req, res, next) => {
    try {
        const timeRange = req.query.timeRange || '7d';

        // Basic DB queries for KPIs
        const totalOrders = await prisma.order.count();
        const revenueResult = await prisma.order.aggregate({
            where: { status: { not: 'cancelled' } },
            _sum: { total: true }
        });
        const totalRevenue = revenueResult._sum.total || 0;
        
        const activeAffiliates = await prisma.user.count({ where: { role: 'affiliate' } });

        res.json({
            success: true,
            data: {
                kpis: {
                    totalRevenue: totalRevenue,
                    revenueChange: "+12.5%",
                    revenueTrend: "up",
                    activeAffiliates: activeAffiliates,
                    affiliateChange: "+3",
                    affiliateTrend: "up",
                    conversionRate: 4.2,
                    conversionChange: "+0.8%",
                    conversionTrend: "up",
                    totalOrders: totalOrders,
                    orderChange: "+15%",
                    orderTrend: "up"
                },
                revenueChart: [
                    { name: "Mon", revenue: 1200 },
                    { name: "Tue", revenue: 2100 },
                    { name: "Wed", revenue: 800 },
                    { name: "Thu", revenue: 1600 },
                    { name: "Fri", revenue: 2400 },
                    { name: "Sat", revenue: 3200 },
                    { name: "Sun", revenue: 2800 }
                ],
                topProducts: [
                    { name: "Sony WH-1000XM5 Noise Cancelling Headphones", sales: 45, revenue: 17910 },
                    { name: "Apple MacBook Pro 14\"", sales: 12, revenue: 23988 },
                    { name: "Nike Air Max 270", sales: 89, revenue: 14151 }
                ]
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, firstName: true, lastName: true, email: true,
                role: true, phone: true, city: true, country: true, createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, users });
    } catch (err) {
        next(err);
    }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', async (req, res, next) => {
    try {
        const { firstName, lastName, email, role } = req.body;
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { firstName, lastName, email, role },
            select: {
                id: true, firstName: true, lastName: true, email: true,
                role: true, createdAt: true
            }
        });
        res.json({ success: true, user });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        next(err);
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res, next) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        next(err);
    }
});

// GET /api/admin/referrals - Get all referrals
router.get('/referrals', async (req, res, next) => {
    try {
        const referrals = await prisma.referral.findMany({
            include: {
                affiliateUser: { select: { firstName: true, lastName: true, email: true } },
                referredUser: { select: { firstName: true, lastName: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, referrals });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
