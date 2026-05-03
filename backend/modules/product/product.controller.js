const prisma = require('../../config/prisma');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { reviews: true }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin,Supervisor
exports.createProduct = async (req, res) => {
    try {
        const { name, description, category, brand, price, comparePrice, sku, stock, images, status, featured, commissionRate } = req.body;
        const product = await prisma.product.create({
            data: {
                name, description, category,
                brand: brand || null,
                price: parseFloat(price),
                comparePrice: comparePrice ? parseFloat(comparePrice) : null,
                sku: sku || null,
                stock: parseInt(stock) || 0,
                images: images || [],
                status: status || 'active',
                featured: featured || false,
                commissionRate: commissionRate ? parseFloat(commissionRate) : null,
            }
        });
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a product (including stock adjustment)
// @route   PUT /api/products/:id
// @access  Private/Admin,Supervisor
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, category, brand, price, comparePrice, sku, stock, images, status, featured, commissionRate } = req.body;

        const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (brand !== undefined) updateData.brand = brand;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (comparePrice !== undefined) updateData.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
        if (sku !== undefined) updateData.sku = sku || null;
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (images !== undefined) updateData.images = images;
        if (status !== undefined) updateData.status = status;
        if (featured !== undefined) updateData.featured = featured;
        if (commissionRate !== undefined) updateData.commissionRate = commissionRate ? parseFloat(commissionRate) : null;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

        await prisma.product.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all products (admin - includes all statuses)
// @route   GET /api/products/admin/all
// @access  Private/Admin,Supervisor
exports.getAllProductsAdmin = async (req, res) => {
    try {
        const { search, category, status } = req.query;
        const where = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (category) where.category = category;
        if (status) where.status = status;

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
