const prisma = require('../config/prisma');

// @desc    Get all products (for viewing stock)
// @route   GET /api/stock-checker/products
// @access  Private/stock_checker
exports.getProducts = async (req, res) => {
    try {
        const { search, lowStock } = req.query;
        const where = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (lowStock === 'true') where.stock = { lt: 10 };

        const products = await prisma.product.findMany({
            where,
            select: {
                id: true, name: true, category: true, brand: true,
                sku: true, stock: true, status: true, images: true,
                stockRequests: {
                    where: { status: 'pending' },
                    select: { id: true, type: true, quantity: true, status: true }
                }
            },
            orderBy: { stock: 'asc' }
        });
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Submit a stock change request (add or remove)
// @route   POST /api/stock-checker/requests
// @access  Private/stock_checker
exports.createRequest = async (req, res) => {
    try {
        const { productId, type, quantity, reason } = req.body;

        if (!productId || !type || !quantity || !reason) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (!['add', 'remove'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Type must be "add" or "remove"' });
        }
        if (parseInt(quantity) <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be positive' });
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (type === 'remove' && product.stock < parseInt(quantity)) {
            return res.status(400).json({ success: false, message: `Cannot remove ${quantity} units — only ${product.stock} in stock` });
        }

        const request = await prisma.stockRequest.create({
            data: {
                productId,
                requestedById: req.user.id,
                type,
                quantity: parseInt(quantity),
                reason,
                status: 'pending'
            },
            include: {
                product: { select: { name: true, stock: true } },
                requestedBy: { select: { firstName: true, lastName: true } }
            }
        });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get MY stock requests
// @route   GET /api/stock-checker/requests
// @access  Private/stock_checker
exports.getMyRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = { requestedById: req.user.id };
        if (status) where.status = status;

        const requests = await prisma.stockRequest.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, stock: true, images: true } },
                reviewedBy: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ─── Supervisor / Admin: review requests ──────────────────────────────────

// @desc    Get ALL pending stock requests
// @route   GET /api/stock-checker/admin/requests
// @access  Private/admin,supervisor
exports.getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;
        else where.status = 'pending'; // default to pending

        const requests = await prisma.stockRequest.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, stock: true, sku: true, images: true } },
                requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
                reviewedBy: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Approve or reject a stock request
// @route   PUT /api/stock-checker/admin/requests/:id
// @access  Private/admin,supervisor
exports.reviewRequest = async (req, res) => {
    try {
        const { action, reviewNote } = req.body; // action: "approve" | "reject"

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
        }

        const request = await prisma.stockRequest.findUnique({
            where: { id: req.params.id },
            include: { product: true }
        });

        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Request already reviewed' });
        }

        // If approving: apply the stock change
        if (action === 'approve') {
            const delta = request.type === 'add' ? request.quantity : -request.quantity;
            const newStock = request.product.stock + delta;

            if (newStock < 0) {
                return res.status(400).json({ success: false, message: 'Insufficient stock to approve removal' });
            }

            await prisma.product.update({
                where: { id: request.productId },
                data: { stock: newStock }
            });
        }

        const updated = await prisma.stockRequest.update({
            where: { id: req.params.id },
            data: {
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedById: req.user.id,
                reviewNote: reviewNote || null
            },
            include: {
                product: { select: { name: true, stock: true } },
                requestedBy: { select: { firstName: true, lastName: true } }
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
