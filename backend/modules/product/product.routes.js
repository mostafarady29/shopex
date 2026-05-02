const express = require('express');
const { getProducts, getProduct, createProduct } = require('./product.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin'), createProduct);

router.route('/:id')
    .get(getProduct);

module.exports = router;
