const prisma = require('../../config/prisma');
const crypto = require('crypto');

// @desc    Create new order and process referral logic
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            referralCode // Passed from frontend cookies/session
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // 1. Calculate Prices
        let subtotal = 0;
        let totalCommissionAmount = 0; // Aggregated commission for this order

        const itemsDetails = await Promise.all(orderItems.map(async (item) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);
            
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            
            return {
                productId: product.id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                // store product level commission rate if exists, for calculation below
                productCommissionRate: product.commissionRate 
            };
        }));

        const tax = subtotal * 0.15; // Mock 15% tax
        const shipping = subtotal > 100 ? 0 : 10;
        const total = subtotal + tax + shipping;

        // 2. Affiliate Logic: Identify Affiliate and calculate commission
        let affiliate = null;
        if (referralCode) {
            affiliate = await prisma.affiliate.findUnique({ where: { referralCode } });
            
            // Fraud Prevention: Don't allow self-referrals
            if (affiliate && affiliate.userId !== req.user.id && affiliate.status === 'active') {
                
                // Calculate commission securely on the backend, NOT on the fly later
                itemsDetails.forEach(item => {
                    // Use product-specific rate if exists, otherwise fallback to affiliate's base rate
                    const appliedRate = item.productCommissionRate || affiliate.commissionRate;
                    const itemCommission = (item.price * item.quantity) * (appliedRate / 100);
                    totalCommissionAmount += itemCommission;
                });
            } else {
                affiliate = null; // Invalidate self-referral or inactive affiliate
            }
        }

        // 3. Database Transaction (Atomic)
        const order = await prisma.$transaction(async (tx) => {
            
            // A. Create Order
            const newOrder = await tx.order.create({
                data: {
                    orderId: `ORD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
                    userId: req.user.id,
                    ...shippingAddress,
                    paymentMethod,
                    subtotal,
                    tax,
                    shipping,
                    total,
                    status: 'paid', // Assuming payment succeeded for this flow
                    items: {
                        create: itemsDetails.map(i => ({
                            productId: i.productId,
                            name: i.name,
                            quantity: i.quantity,
                            price: i.price
                        }))
                    }
                }
            });

            // B. Create Referral Record (if valid affiliate)
            if (affiliate && totalCommissionAmount > 0) {
                await tx.referral.create({
                    data: {
                        affiliateId: affiliate.id,
                        orderId: newOrder.id,
                        commissionAmount: totalCommissionAmount,
                        status: 'pending' // Pending until return period expires
                    }
                });
                
                // Update Affiliate Wallet (Pending Balance)
                await tx.wallet.upsert({
                    where: { affiliateId: affiliate.id },
                    update: { pendingBalance: { increment: totalCommissionAmount } },
                    create: { affiliateId: affiliate.id, pendingBalance: totalCommissionAmount }
                });
            }

            return newOrder;
        });

        res.status(201).json({ success: true, data: order });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
