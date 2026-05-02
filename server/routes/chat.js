const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

// POST /api/chat - Send message & get AI response (authenticated users)
router.post('/', protect, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Save user message to DB
        await prisma.chatMessage.create({
            data: { userId, role: 'user', content: message }
        });

        // Get last 20 messages for context
        const history = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const chatHistory = history.reverse().map(m => ({
            role: m.role,
            content: m.content,
        }));

        // Get user info for context
        const userOrders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { items: { include: { product: true } } },
        });

        // Call Python AI service
        const aiResponse = await fetch(`${PYTHON_AI_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                user_id: userId,
                user_name: `${req.user.firstName} ${req.user.lastName}`,
                user_role: req.user.role,
                chat_history: chatHistory,
                user_orders: userOrders.map(o => ({
                    orderId: o.orderId,
                    status: o.status,
                    total: o.total,
                    date: o.createdAt,
                    items: o.items.map(i => i.name),
                })),
            }),
        });

        const aiData = await aiResponse.json();
        const aiReply = aiData.response || 'Sorry, I could not process that.';

        // Save assistant response to DB
        await prisma.chatMessage.create({
            data: { userId, role: 'assistant', content: aiReply }
        });

        res.json({ success: true, data: { reply: aiReply } });
    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ success: false, message: 'AI service error' });
    }
});

// POST /api/chat/guest - Send message without auth (guest users)
router.post('/guest', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const aiResponse = await fetch(`${PYTHON_AI_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, user_id: null }),
        });

        const aiData = await aiResponse.json();
        const aiReply = aiData.response || 'Sorry, I could not process that.';

        res.json({ success: true, data: { reply: aiReply } });
    } catch (err) {
        console.error('Guest chat error:', err.message);
        res.status(500).json({ success: false, message: 'AI service error' });
    }
});

// GET /api/chat/history - Get chat history for authenticated user
router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });

        res.json({ success: true, data: messages });
    } catch (err) {
        console.error('History error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to load chat history' });
    }
});

// DELETE /api/chat/history - Clear chat history for authenticated user
router.delete('/history', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.chatMessage.deleteMany({ where: { userId } });
        res.json({ success: true, message: 'Chat history cleared' });
    } catch (err) {
        console.error('Clear history error:', err.message);
        res.status(500).json({ success: false, message: 'Failed to clear history' });
    }
});

module.exports = router;
