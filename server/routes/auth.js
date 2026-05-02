const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

// Helper: generate referral code
const generateReferralCode = (firstName) => {
    return firstName.toUpperCase() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Helper: sign JWT
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, referralCode } = req.body;

        // Use firstName/lastName or fallback from a single 'name' field
        let fName = firstName;
        let lName = lastName || '';
        if (!fName && req.body.name) {
            const parts = req.body.name.split(' ');
            fName = parts[0];
            lName = parts.slice(1).join(' ') || '';
        }

        if (!fName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const refCode = generateReferralCode(fName);

        const user = await prisma.user.create({
            data: {
                firstName: fName,
                lastName: lName,
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: role || 'customer',
            }
        });

        // If a referral code was provided, create a pending referral
        if (referralCode) {
            const affiliate = await prisma.user.findFirst({
                where: { id: { not: user.id } }
                // In production, look up by a stored referral code field
            });
            // For now we just track it — full referral logic is in orders
        }

        const token = signToken(user.id, user.role);
        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };

        res.status(201).json({ success: true, token, user: userData });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = signToken(user.id, user.role);
        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };

        res.json({ success: true, token, user: userData });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });
    res.json({ success: true, user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
