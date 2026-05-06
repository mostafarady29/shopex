const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email address' });
        }

        // Check if already subscribed
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (existingSubscriber) {
            return res.status(400).json({ success: false, message: 'Email is already subscribed' });
        }

        // Add to database
        await prisma.newsletterSubscriber.create({
            data: { email: email.toLowerCase().trim() }
        });

        res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
