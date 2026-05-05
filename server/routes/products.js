const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect, authorize } = require('../middleware/auth');

// GET /api/products - Get all products with filters
router.get('/', async (req, res, next) => {
    try {
        const { category, brand, search, sort, minPrice, maxPrice, minRating, featured, page = 1, limit = 12 } = req.query;

        const where = { status: 'active' };
        if (category) where.category = { contains: category, mode: 'insensitive' };
        if (brand) where.brand = { in: brand.split(',') };
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (featured === 'true') where.featured = true;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }
        if (minRating) where.rating = { gte: Number(minRating) };

        let orderBy = {};
        if (sort === 'price-low') orderBy = { price: 'asc' };
        else if (sort === 'price-high') orderBy = { price: 'desc' };
        else if (sort === 'rating') orderBy = { rating: 'desc' };
        else orderBy = { createdAt: 'desc' };

        const total = await prisma.product.count({ where });
        const products = await prisma.product.findMany({
            where,
            orderBy,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
        });

        res.json({
            success: true,
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/filters - Get dynamic categories and popular brands
router.get('/filters', async (req, res, next) => {
    try {
        // Fetch distinct categories
        const categoriesResult = await prisma.product.findMany({
            where: { status: 'active' },
            select: { category: true },
            distinct: ['category'],
        });
        const categories = categoriesResult.map(c => c.category).filter(Boolean);

        // Fetch distinct brands (only valid ones)
        const brandsResult = await prisma.product.findMany({
            where: { 
                status: 'active',
                brand: { not: null, notIn: [''] }
            },
            select: { brand: true },
            distinct: ['brand'],
        });
        const brands = brandsResult.map(b => b.brand).filter(Boolean);

        res.json({
            success: true,
            categories,
            brands
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/admin/all - Get all products for admin (includes inactive)
router.get('/admin/all', protect, authorize('admin', 'moderator'), async (req, res, next) => {
    try {
        const { search, status } = req.query;
        const where = {};
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (status) where.status = status;

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                reviews: {
                    include: { user: { select: { firstName: true, lastName: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (err) {
        next(err);
    }
});

// POST /api/products - Create product (admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
    try {
        const product = await prisma.product.create({ data: req.body });
        res.status(201).json({ success: true, product });
    } catch (err) {
        next(err);
    }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, product });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        next(err);
    }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        next(err);
    }
});

module.exports = router;
