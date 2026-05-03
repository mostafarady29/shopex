const prisma = require('../../config/prisma');

// @desc    Get all open tickets (for call center agents)
// @route   GET /api/call-center/tickets
// @access  Private/call_center,admin,supervisor
exports.getTickets = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) where.status = status;
        // Call center agents only see open tickets or ones assigned to them
        if (req.user.role === 'call_center') {
            where.OR = [
                { status: 'open' },
                { assignedToId: req.user.id }
            ];
        }

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: { sender: { select: { firstName: true, role: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get a single ticket with full conversation
// @route   GET /api/call-center/tickets/:id
// @access  Private/call_center,admin,supervisor
exports.getTicket = async (req, res) => {
    try {
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { firstName: true, lastName: true, role: true } } }
                }
            }
        });

        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        // Call center agents can only view tickets assigned to them or open ones
        if (req.user.role === 'call_center' &&
            ticket.status !== 'open' &&
            ticket.assignedToId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, data: ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Assign ticket to self (call center agent picks it up)
// @route   PUT /api/call-center/tickets/:id/assign
// @access  Private/call_center
exports.assignTicket = async (req, res) => {
    try {
        const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        if (ticket.status !== 'open') {
            return res.status(400).json({ success: false, message: 'Ticket is not open' });
        }

        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { assignedToId: req.user.id, status: 'assigned' },
            include: {
                user: { select: { firstName: true, lastName: true, email: true } },
                assignedTo: { select: { firstName: true, lastName: true } }
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send a reply message in a ticket
// @route   POST /api/call-center/tickets/:id/messages
// @access  Private/call_center,admin,supervisor
exports.sendMessage = async (req, res) => {
    try {
        const { body } = req.body;
        if (!body) return res.status(400).json({ success: false, message: 'Message body is required' });

        const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        if (ticket.status === 'resolved') {
            return res.status(400).json({ success: false, message: 'Ticket is already resolved' });
        }

        const message = await prisma.ticketMessage.create({
            data: {
                ticketId: req.params.id,
                senderId: req.user.id,
                body,
                isAgent: true
            },
            include: { sender: { select: { firstName: true, lastName: true, role: true } } }
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Resolve a ticket
// @route   PUT /api/call-center/tickets/:id/resolve
// @access  Private/call_center,admin,supervisor
exports.resolveTicket = async (req, res) => {
    try {
        const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        const updated = await prisma.supportTicket.update({
            where: { id: req.params.id },
            data: { status: 'resolved' }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ─── Customer: create ticket (escalate from AI chat) ──────────────────────

// @desc    Customer creates a support ticket (request human agent)
// @route   POST /api/call-center/tickets
// @access  Private (any authenticated user)
exports.createTicket = async (req, res) => {
    try {
        const { subject, firstMessage } = req.body;
        if (!subject || !firstMessage) {
            return res.status(400).json({ success: false, message: 'Subject and message are required' });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: req.user.id,
                subject,
                status: 'open',
                messages: {
                    create: {
                        senderId: req.user.id,
                        body: firstMessage,
                        isAgent: false
                    }
                }
            },
            include: {
                messages: true,
                user: { select: { firstName: true, lastName: true } }
            }
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Customer sends a message in their ticket
// @route   POST /api/call-center/my-tickets/:id/messages
// @access  Private (ticket owner)
exports.customerReply = async (req, res) => {
    try {
        const { body } = req.body;
        if (!body) return res.status(400).json({ success: false, message: 'Message body is required' });

        const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        if (ticket.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });
        if (ticket.status === 'resolved') return res.status(400).json({ success: false, message: 'Ticket resolved' });

        const message = await prisma.ticketMessage.create({
            data: { ticketId: req.params.id, senderId: req.user.id, body, isAgent: false },
            include: { sender: { select: { firstName: true, lastName: true } } }
        });

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Customer views their own tickets
// @route   GET /api/call-center/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user.id },
            include: {
                assignedTo: { select: { firstName: true, lastName: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: tickets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
