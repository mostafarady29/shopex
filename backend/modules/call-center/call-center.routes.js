const express = require('express');
const {
    getTickets, getTicket, assignTicket, sendMessage, resolveTicket,
    createTicket, customerReply, getMyTickets
} = require('./call-center.controller');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();
router.use(protect);

// ── Agent / Admin routes ──────────────────────────────────────────────────
router.get('/tickets',
    authorize('call_center', 'admin', 'supervisor'),
    getTickets);

router.get('/tickets/:id',
    authorize('call_center', 'admin', 'supervisor'),
    getTicket);

router.put('/tickets/:id/assign',
    authorize('call_center'),
    assignTicket);

router.post('/tickets/:id/messages',
    authorize('call_center', 'admin', 'supervisor'),
    sendMessage);

router.put('/tickets/:id/resolve',
    authorize('call_center', 'admin', 'supervisor'),
    resolveTicket);

// ── Customer routes (any authenticated user) ─────────────────────────────
router.post('/my-tickets',              createTicket);
router.get('/my-tickets',               getMyTickets);
router.post('/my-tickets/:id/messages', customerReply);

module.exports = router;
