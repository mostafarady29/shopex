const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');

// ─── Helper ──────────────────────────────────────────────────────────────────
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

function getPreviousPeriod(timeRange) {
    const { start, end } = getDateRange(timeRange);
    const duration = end.getTime() - start.getTime();
    return { start: new Date(start.getTime() - duration), end: start };
}

// ─── Analytics ───────────────────────────────────────────────────────────────
// @desc    Get platform analytics with time-based filtering
// @route   GET /api/admin/analytics?timeRange=7d
// @access  Private/Admin,Supervisor
exports.getAnalytics = async (req, res) => {
    try {
        const timeRange = req.query.timeRange || '7d';
        const { start, end } = getDateRange(timeRange);
        const prev = getPreviousPeriod(timeRange);

        const currentOrders = await prisma.order.findMany({
            where: { createdAt: { gte: start, lte: end }, status: { in: ['paid', 'shipped', 'delivered'] } }
        });
        const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);
        const currentOrderCount = currentOrders.length;

        const prevOrders = await prisma.order.findMany({
            where: { createdAt: { gte: prev.start, lte: prev.end }, status: { in: ['paid', 'shipped', 'delivered'] } }
        });
        const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);
        const prevOrderCount = prevOrders.length;

        const activeAffiliates = await prisma.affiliate.count({ where: { status: 'active' } });

        const currentReferrals = await prisma.referral.count({ where: { createdAt: { gte: start, lte: end } } });
        const prevReferrals    = await prisma.referral.count({ where: { createdAt: { gte: prev.start, lte: prev.end } } });

        const conversionRate     = currentOrderCount > 0 ? (currentReferrals / currentOrderCount) * 100 : 0;
        const prevConversionRate = prevOrderCount > 0 ? (prevReferrals / prevOrderCount) * 100 : 0;

        const revenueChange    = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : '0.0';
        const orderChange      = prevOrderCount > 0 ? ((currentOrderCount - prevOrderCount) / prevOrderCount * 100).toFixed(1) : '0.0';
        const conversionChange = prevConversionRate > 0 ? ((conversionRate - prevConversionRate) / prevConversionRate * 100).toFixed(1) : '0.0';

        const revenueChart = await buildRevenueChart(timeRange, start, end);

        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId', 'name'],
            _sum: { price: true },
            _count: { id: true },
            where: { order: { createdAt: { gte: start, lte: end }, status: { in: ['paid', 'shipped', 'delivered'] } } },
            orderBy: { _sum: { price: 'desc' } },
            take: 5
        });

        const topProductsList = topProducts.map(p => ({
            name: p.name,
            sales: p._count.id,
            revenue: +(p._sum.price || 0).toFixed(2)
        }));

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

async function buildRevenueChart(timeRange, start, end) {
    const orders = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end }, status: { in: ['paid', 'shipped', 'delivered'] } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
    });
    const buckets = {};
    if (timeRange === '24h') {
        for (let h = 0; h < 24; h++) { const label = `${h.toString().padStart(2, '0')}:00`; buckets[label] = 0; }
        orders.forEach(o => { const label = `${o.createdAt.getHours().toString().padStart(2, '0')}:00`; buckets[label] += o.total; });
    } else if (timeRange === '7d') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let d = 6; d >= 0; d--) { const date = new Date(end.getTime() - d * 86400000); buckets[days[date.getDay()]] = 0; }
        orders.forEach(o => { const day = days[o.createdAt.getDay()]; if (buckets[day] !== undefined) buckets[day] += o.total; });
    } else if (timeRange === '30d') {
        for (let w = 0; w < 4; w++) buckets[`Week ${w + 1}`] = 0;
        orders.forEach(o => { const week = Math.min(Math.floor((o.createdAt.getTime() - start.getTime()) / 86400000 / 7), 3); buckets[`Week ${week + 1}`] += o.total; });
    } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let m = 11; m >= 0; m--) { const date = new Date(end.getFullYear(), end.getMonth() - m, 1); buckets[months[date.getMonth()]] = 0; }
        orders.forEach(o => { const month = months[o.createdAt.getMonth()]; if (buckets[month] !== undefined) buckets[month] += o.total; });
    }
    return Object.entries(buckets).map(([name, revenue]) => ({ name, revenue: +revenue.toFixed(2) }));
}

// ─── Affiliate ────────────────────────────────────────────────────────────────
// @desc    Approve affiliate
// @route   POST /api/admin/approve-affiliate
// @access  Private/Admin,Supervisor
exports.approveAffiliate = async (req, res) => {
    try {
        const { affiliateId } = req.body;
        const affiliate = await prisma.affiliate.update({ where: { id: affiliateId }, data: { status: 'active' } });
        res.json({ success: true, data: affiliate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ─── User Management ─────────────────────────────────────────────────────────
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin,Supervisor
exports.getUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName:  { contains: search, mode: 'insensitive' } },
                { email:     { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) where.role = role;

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true, firstName: true, lastName: true, email: true,
                role: true, phone: true, createdAt: true,
                orders: { select: { id: true } },
                affiliate: { select: { id: true, status: true, referralCode: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a user (admin can create admin/supervisor accounts)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const allowedRoles = ['customer', 'affiliate', 'admin', 'supervisor', 'stock_checker', 'call_center'];
        const assignedRole = allowedRoles.includes(role) ? role : 'customer';

        // Only admin can create other admins/supervisors
        if ((assignedRole === 'admin' || assignedRole === 'supervisor') && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can create admin/supervisor accounts' });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { firstName, lastName, email, password: hashedPassword, role: assignedRole, phone: phone || null },
            select: { id: true, firstName: true, lastName: true, email: true, role: true, phone: true, createdAt: true }
        });

        // Create affiliate profile if role is affiliate
        if (assignedRole === 'affiliate') {
            const affiliate = await prisma.affiliate.create({
                data: { userId: user.id, referralCode: `REF-${user.id.substring(0, 8).toUpperCase()}`, status: 'active' }
            });
            await prisma.wallet.create({ data: { affiliateId: affiliate.id } });
        }

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a user (role, details)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin,Supervisor
exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, role, phone, password } = req.body;

        const target = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!target) return res.status(404).json({ success: false, message: 'User not found' });

        // Supervisors cannot change admin accounts or promote to admin
        if (req.user.role === 'supervisor') {
            if (target.role === 'admin' || role === 'admin') {
                return res.status(403).json({ success: false, message: 'Supervisors cannot modify admin accounts' });
            }
        }

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName)  updateData.lastName  = lastName;
        if (email)     updateData.email     = email;
        if (phone !== undefined) updateData.phone = phone;
        if (role) {
            const allowedRoles = ['customer', 'affiliate', 'admin', 'supervisor', 'stock_checker', 'call_center'];
            if (allowedRoles.includes(role)) updateData.role = role;
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData,
            select: { id: true, firstName: true, lastName: true, email: true, role: true, phone: true, createdAt: true }
        });

        // If role changed to affiliate, create affiliate profile if not already there
        if (role === 'affiliate') {
            const existingAffiliate = await prisma.affiliate.findUnique({ where: { userId: user.id } });
            if (!existingAffiliate) {
                const affiliate = await prisma.affiliate.create({
                    data: { userId: user.id, referralCode: `REF-${user.id.substring(0, 8).toUpperCase()}`, status: 'active' }
                });
                await prisma.wallet.create({ data: { affiliateId: affiliate.id } });
            }
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }

        const target = await prisma.user.findUnique({ where: { id: req.params.id } });
        if (!target) return res.status(404).json({ success: false, message: 'User not found' });

        if (target.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete an admin account' });
        }

        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
