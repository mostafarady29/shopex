const express = require('express');
const { handleChat } = require('./ai.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.post('/chat', protect, handleChat);

module.exports = router;
