// AI microservice integration

const prisma = require('../../config/prisma');

// @desc    Handle chat interaction
// @route   POST /api/ai/chat
// @access  Private
exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user; // Extract user from JWT context

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // ── Human escalation detection ─────────────────────────────────────────
        const humanTriggers = [
            'talk to human', 'speak to agent', 'real person', 'human agent',
            'call center', 'customer service', 'live agent', 'speak to someone',
            'connect me to', 'i want a human', 'talk to someone', 'بشري', 'موظف',
            'شخص حقيقي', 'تكلم انسان'
        ];
        const lowerMsg = message.toLowerCase();
        const wantsHuman = humanTriggers.some(t => lowerMsg.includes(t));

        if (wantsHuman) {
            try {
                // Create a support ticket automatically
                const ticket = await prisma.supportTicket.create({
                    data: {
                        userId: user.id,
                        subject: `Chat escalation from ${user.firstName} ${user.lastName}`,
                        status: 'open',
                        messages: {
                            create: {
                                senderId: user.id,
                                body: message,
                                isAgent: false
                            }
                        }
                    }
                });
                return res.json({
                    success: true,
                    data: {
                        reply: `I've connected you with our support team. A customer service agent will be with you shortly. Your ticket ID is: **${ticket.id.substring(0, 8).toUpperCase()}**. You can also track your ticket status in your account.`,
                        escalated: true,
                        ticketId: ticket.id
                    }
                });
            } catch (escalateErr) {
                console.error("Escalation error:", escalateErr);
                // Fall through to normal AI response if ticket creation fails
            }
        }
        // ──────────────────────────────────────────────────────────────────────

        let systemContext = `You are the ShopEx AI Assistant. ShopEx is an e-commerce platform. You must be helpful, concise, and professional. The user's name is ${user.firstName} ${user.lastName} and their role is ${user.role}. `;

        // Build database context based on user role
        try {
            if (user.role === 'admin') {
                const totalOrders = await prisma.order.count();
                const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } });
                const totalUsers = await prisma.user.count();
                systemContext += `Platform Stats: Total Orders: ${totalOrders}, Total Revenue: $${totalRevenue._sum.total || 0}, Total Users: ${totalUsers}. `;
            } else if (user.role === 'affiliate') {
                const affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id }, include: { Wallet: true } });
                const referrals = await prisma.referral.count({ where: { affiliateId: affiliate?.id } });
                systemContext += `Affiliate Stats: Your Referral Code: ${affiliate?.code}, Total Referrals: ${referrals}, Wallet Balance: $${affiliate?.Wallet?.balance || 0}. `;
            } else {
                const recentOrders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 3 });
                systemContext += `Customer Stats: You have ${recentOrders.length} recent orders. `;
                if (recentOrders.length > 0) {
                    systemContext += `Your latest order status is: ${recentOrders[0].status}. `;
                }
            }
        } catch (dbErr) {
            console.error("DB Context Error:", dbErr);
        }

        const getOfflineReply = async () => {
            let reply = "I am the ShopEx Assistant. My AI capabilities are currently in offline mode (Python Microservice is unreachable). ";
            
            if (user.role === 'admin' && message.toLowerCase().includes("revenue")) {
                const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } });
                reply += `Our total revenue is $${totalRevenue._sum.total || 0}.`;
            } else if (user.role === 'admin') {
                const totalUsers = await prisma.user.count();
                reply += `We currently have ${totalUsers} registered users.`;
            } else if (user.role === 'affiliate') {
                const affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id }, include: { Wallet: true } });
                reply += `Your current wallet balance is $${affiliate?.Wallet?.balance || 0} and your code is ${affiliate?.code}.`;
            } else {
                const recentOrders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 1 });
                if (recentOrders.length > 0) {
                    reply += `Your latest order (ID: ${recentOrders[0].id.substring(0,8)}) is currently ${recentOrders[0].status}.`;
                } else {
                    reply += "How can I help you today?";
                }
            }
            return reply;
        };

        const PYTHON_AI_URL = 'http://localhost:8000/chat';

        try {
            // Use Python Microservice
            const response = await fetch(PYTHON_AI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    context: systemContext
                })
            });

            if (!response.ok) {
                throw new Error(`Python AI Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            return res.json({ success: true, data: { reply: data.reply } });

        } catch (apiError) {
            console.error("Python AI Microservice Error:", apiError.message || apiError);
            // Fallback on API Error or if Python server is offline
            const fallbackReply = await getOfflineReply();
            return res.json({ success: true, data: { reply: fallbackReply } });
        }

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ success: false, message: 'Server Error processing AI chat' });
    }
};
