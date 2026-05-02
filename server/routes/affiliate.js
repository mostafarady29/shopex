const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

// GET /api/affiliate/dashboard
// Returns affiliate stats: registered customers, paid subscriptions/orders, total commissions, and the referral link.
router.get('/dashboard', protect, async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Retrieve all referrals tied to this affiliate
        const referrals = await prisma.referral.findMany({
            where: { affiliateUserId: user.id },
            include: {
                referredUser: { select: { firstName: true, lastName: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Count unique referred users
        const registeredUsers = new Set(referrals.filter(r => r.referredUserId).map(r => r.referredUserId)).size;
        const paidSubscriptions = referrals.filter(r => r.status === 'converted' || r.status === 'paid').length;
        const totalCommissions = referrals.reduce((sum, r) => sum + r.commission, 0);

        // Generate a referral code from the user's name
        const referralCode = user.firstName.toUpperCase().slice(0, 2) + '-' + user.id.slice(0, 5).toUpperCase();

        res.json({
            success: true,
            referralCode,
            registeredUsers,
            paidSubscriptions,
            totalCommissions,
            recentReferrals: referrals.slice(0, 10)
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
