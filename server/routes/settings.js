const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get global settings
// @access  Private/Admin
router.get('/', protect, authorize('admin', 'superadmin'), async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'global' },
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/settings
// @desc    Update global settings
// @access  Private/Admin
router.put('/', protect, authorize('admin', 'superadmin'), async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.updatedAt;

    let settings = await prisma.settings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'global', ...updateData },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: 'global' },
        data: updateData,
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
