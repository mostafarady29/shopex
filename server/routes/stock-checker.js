const express = require('express');
const {
    getProducts,
    createRequest,
    getMyRequests,
    getAllRequests,
    reviewRequest
} = require('./stock-checker.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Stock checker routes
router.get('/products',  authorize('stock_checker', 'admin', 'supervisor'), getProducts);
router.post('/requests', authorize('stock_checker'), createRequest);
router.get('/requests',  authorize('stock_checker'), getMyRequests);

// Admin / supervisor review routes
router.get('/admin/requests',       authorize('admin', 'supervisor'), getAllRequests);
router.put('/admin/requests/:id',   authorize('admin', 'supervisor'), reviewRequest);

module.exports = router;
