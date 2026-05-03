const prisma = require('../../config/prisma');
const generateToken = require('../../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, role } = req.body;

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let assignedRole = 'customer';
        if (role && (role.toLowerCase() === 'affiliate' || role.toLowerCase() === 'customer')) {
            assignedRole = role.toLowerCase();
        }

        const user = await prisma.user.create({
            data: { firstName, lastName, email, password: hashedPassword, phone, role: assignedRole }
        });

        if (assignedRole === 'affiliate') {
            const affiliate = await prisma.affiliate.create({
                data: {
                    userId: user.id,
                    referralCode: `REF-${user.id.substring(0, 8).toUpperCase()}`,
                    status: 'active'
                }
            });
            await prisma.wallet.create({
                data: {
                    affiliateId: affiliate.id
                }
            });
        }

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                phone: true,
                affiliate: true
            }
        });

        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
