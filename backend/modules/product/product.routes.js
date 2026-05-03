const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getAllProductsAdmin } = require('./product.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Admin-only route: all products with full details
router.get('/admin/all', protect, authorize('admin', 'supervisor'), getAllProductsAdmin);

// Public routes
router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin', 'supervisor'), createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('admin', 'supervisor'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
