const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { protect } = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are ShopEx Assistant — the official AI helper for the ShopEx e-commerce platform.

Your role:
- Help customers find products, track orders, understand return policies, and answer shopping questions.
- Help affiliates understand their commissions, generate referral links, and get marketing tips.
- Help admins get quick insights about revenue, top products, and user activity.

Behavior rules:
- Be friendly, concise, and helpful.
- If you don't know something specific about the user's data, say so honestly.
- Never make up order statuses or product details — only use information provided in context.
- Support both English and Arabic — respond in the same language the user uses.
- Keep responses under 200 words unless the user asks for detail.`;

// Helper: call Gemini API
async function callGemini(message, chatHistory, contextParts) {
    let systemInstruction = SYSTEM_PROMPT;
    if (contextParts && contextParts.length > 0) {
        systemInstruction += '\n\nCurrent user context:\n' + contextParts.join('\n');
    }

    try {
    // Build contents array from chat history
    const contents = [];
    if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory.slice(0, -1)) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            });
        }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents,
        config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1024,
        },
    });

    return response.text || 'Sorry, I could not process that.';
    } catch (err) {
        const errMsg = err.message || '';
        if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
            return "I'm currently at my daily AI limit. Please try again in a few hours! 🙏";
        }
        throw err;
    }
}

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

        // Get user orders for context
        const userOrders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { items: { include: { product: true } } },
        });

        // Build context
        const contextParts = [];
        contextParts.push(`User: ${req.user.firstName} ${req.user.lastName} (Role: ${req.user.role})`);
        
        if (userOrders.length > 0) {
            const ordersText = userOrders.map(o =>
                `- Order #${o.orderId}: ${o.status} | $${o.total} | Items: ${o.items.map(i => i.name).join(', ')}`
            ).join('\n');
            contextParts.push(`Recent orders:\n${ordersText}`);
        }

        // Call Gemini directly
        const aiReply = await callGemini(message, chatHistory, contextParts);

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

        const aiReply = await callGemini(message, [], []);
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
