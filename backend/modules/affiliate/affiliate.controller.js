const prisma = require('../../config/prisma');

// @desc    Get affiliate dashboard stats
// @route   GET /api/affiliate/dashboard
// @access  Private (Affiliate only)
exports.getDashboard = async (req, res) => {
    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: req.user.id },
            include: { wallet: true }
        });

        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate profile not found' });
        }

        // Aggregate conversions and sales from Referrals
        const referrals = await prisma.referral.findMany({
            where: { affiliateId: affiliate.id }
        });

        const totalConversions = referrals.length;
        const totalSales = referrals.reduce((sum, ref) => sum + ref.commissionAmount, 0);

        res.json({
            success: true,
            data: {
                affiliate,
                stats: {
                    totalConversions,
                    totalSales,
                    pendingBalance: affiliate.wallet?.pendingBalance || 0,
                    availableBalance: affiliate.wallet?.balance || 0
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Generate a custom tracking link
// @route   POST /api/affiliate/generate-link
// @access  Private (Affiliate only)
exports.generateLink = async (req, res) => {
    try {
        const { targetUrl } = req.body;
        
        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: req.user.id }
        });

        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate profile not found' });
        }

        if (!targetUrl) {
            return res.status(400).json({ success: false, message: 'Target URL is required' });
        }

        // Basic URL builder
        const separator = targetUrl.includes('?') ? '&' : '?';
        const trackedLink = `${targetUrl}${separator}ref=${affiliate.referralCode}`;

        res.json({
            success: true,
            data: {
                trackedLink,
                referralCode: affiliate.referralCode
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
