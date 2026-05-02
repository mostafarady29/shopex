const prisma = require('../../config/prisma');

// Helper: get date range from timeRange param
function getDateRange(timeRange) {
    const now = new Date();
    let start;
    switch (timeRange) {
        case '24h': start = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
        case '7d':  start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case '30d': start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        case '1y':  start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
        default:    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return { start, end: now };
}

// Helper: get previous period for comparison
function getPreviousPeriod(timeRange) {
    const { start, end } = getDateRange(timeRange);
    const duration = end.getTime() - start.getTime();
    return { start: new Date(start.getTime() - duration), end: start };
}

// @desc    Get platform analytics with time-based filtering
// @route   GET /api/admin/analytics?timeRange=7d
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        const timeRange = req.query.timeRange || '7d';
        const { start, end } = getDateRange(timeRange);
        const prev = getPreviousPeriod(timeRange);

        // Current period metrics
        const currentOrders = await prisma.order.findMany({
            where: { createdAt: { gte: start, lte: end }, status: { in: ['paid', 'shipped', 'delivered'] } }
        });
        const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);
        const currentOrderCount = currentOrders.length;

        // Previous period metrics (for % change)
        const prevOrders = await prisma.order.findMany({
            where: { createdAt: { gte: prev.start, lte: prev.end }, status: { in: ['paid', 'shipped', 'delivered'] } }
        });
        const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);
        const prevOrderCount = prevOrders.length;

        // Active affiliates
        const activeAffiliates = await prisma.affiliate.count({ where: { status: 'active' } });

        // Referrals in period
        const currentReferrals = await prisma.referral.count({
            where: { createdAt: { gte: start, lte: end } }
        });
        const prevReferrals = await prisma.referral.count({
            where: { createdAt: { gte: prev.start, lte: prev.end } }
        });

        // Conversion rate = orders with referral / total orders
        const conversionRate = currentOrderCount > 0 ? (currentReferrals / currentOrderCount) * 100 : 0;
        const prevConversionRate = prevOrderCount > 0 ? (prevReferrals / prevOrderCount) * 100 : 0;

        // Calculate percentage changes
        const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : '0.0';
        const orderChange = prevOrderCount > 0 ? ((currentOrderCount - prevOrderCount) / prevOrderCount * 100).toFixed(1) : '0.0';
        const conversionChange = prevConversionRate > 0 ? ((conversionRate - prevConversionRate) / prevConversionRate * 100).toFixed(1) : '0.0';

        // Revenue chart data (grouped by day/week/month depending on range)
        const revenueChart = await buildRevenueChart(timeRange, start, end);

        // Top products by revenue in period
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId', 'name'],
            _sum: { price: true },
            _count: { id: true },
            where: {
                order: { createdAt: { gte: start, lte: end }, status: { in: ['paid', 'shipped', 'delivered'] } }
            },
            orderBy: { _sum: { price: 'desc' } },
            take: 5
        });

        const topProductsList = topProducts.map(p => ({
            name: p.name,
            sales: p._count.id,
            revenue: +(p._sum.price || 0).toFixed(2)
        }));

        // Unpaid earnings
        const unpaidEarnings = await prisma.wallet.aggregate({ _sum: { balance: true, pendingBalance: true } });

        res.json({
            success: true,
            data: {
                timeRange,
                kpis: {
                    totalRevenue: +currentRevenue.toFixed(2),
                    revenueChange: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
                    revenueTrend: parseFloat(revenueChange) >= 0 ? 'up' : 'down',

                    activeAffiliates,
                    affiliateChange: '+0.0%',
                    affiliateTrend: 'up',

                    conversionRate: +conversionRate.toFixed(2),
                    conversionChange: `${conversionChange >= 0 ? '+' : ''}${conversionChange}%`,
                    conversionTrend: parseFloat(conversionChange) >= 0 ? 'up' : 'down',

                    totalOrders: currentOrderCount,
                    orderChange: `${orderChange >= 0 ? '+' : ''}${orderChange}%`,
                    orderTrend: parseFloat(orderChange) >= 0 ? 'up' : 'down',
                },
                revenueChart,
                topProducts: topProductsList,
                unpaidEarnings: (unpaidEarnings._sum.balance || 0) + (unpaidEarnings._sum.pendingBalance || 0)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Build revenue chart data based on time range
async function buildRevenueChart(timeRange, start, end) {
    const orders = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end }, status: { in: ['paid', 'shipped', 'delivered'] } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
    });

    const buckets = {};

    if (timeRange === '24h') {
        // Group by hour
        for (let h = 0; h < 24; h++) {
            const label = `${h.toString().padStart(2, '0')}:00`;
            buckets[label] = 0;
        }
        orders.forEach(o => {
            const h = o.createdAt.getHours();
            const label = `${h.toString().padStart(2, '0')}:00`;
            buckets[label] += o.total;
        });
    } else if (timeRange === '7d') {
        // Group by day name
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let d = 6; d >= 0; d--) {
            const date = new Date(end.getTime() - d * 86400000);
            buckets[days[date.getDay()]] = 0;
        }
        orders.forEach(o => {
            const day = days[o.createdAt.getDay()];
            if (buckets[day] !== undefined) buckets[day] += o.total;
        });
    } else if (timeRange === '30d') {
        // Group by week
        for (let w = 0; w < 4; w++) {
            buckets[`Week ${w + 1}`] = 0;
        }
        orders.forEach(o => {
            const daysDiff = Math.floor((o.createdAt.getTime() - start.getTime()) / 86400000);
            const week = Math.min(Math.floor(daysDiff / 7), 3);
            buckets[`Week ${week + 1}`] += o.total;
        });
    } else {
        // 1y: Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let m = 11; m >= 0; m--) {
            const date = new Date(end.getFullYear(), end.getMonth() - m, 1);
            buckets[months[date.getMonth()]] = 0;
        }
        orders.forEach(o => {
            const month = months[o.createdAt.getMonth()];
            if (buckets[month] !== undefined) buckets[month] += o.total;
        });
    }

    return Object.entries(buckets).map(([name, revenue]) => ({
        name,
        revenue: +revenue.toFixed(2)
    }));
}

// @desc    Approve affiliate
// @route   POST /api/admin/approve-affiliate
// @access  Private/Admin
exports.approveAffiliate = async (req, res) => {
    try {
        const { affiliateId } = req.body;

        const affiliate = await prisma.affiliate.update({
            where: { id: affiliateId },
            data: { status: 'active' }
        });

        res.json({ success: true, data: affiliate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
