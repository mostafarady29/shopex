const express = require('express');
const { getAnalytics, approveAffiliate } = require('./admin.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.post('/approve-affiliate', approveAffiliate);

module.exports = router;
