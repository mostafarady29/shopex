const express = require('express');
const {
    getAnalytics,
    approveAffiliate,
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require('./admin.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'supervisor'));

// Analytics
router.get('/analytics', getAnalytics);

// Affiliate management
router.post('/approve-affiliate', approveAffiliate);

// User management (supervisors can view/create/update but not delete admins)
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', authorize('admin'), deleteUser); // only full admin can delete

module.exports = router;
