const express = require('express');
const { getDashboard, generateLink } = require('./affiliate.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Apply protection and affiliate-only authorization to all routes in this module
router.use(protect);
router.use(authorize('affiliate', 'admin'));

router.get('/dashboard', getDashboard);
router.post('/generate-link', generateLink);

module.exports = router;
