const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/error');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - allow frontend
app.use(cors({ origin: '*', credentials: true }));

// Serve static files (frontend assets)
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/affiliate', require('./routes/affiliate'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'SaaS Hub API is running', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server (no MongoDB - using Prisma/PostgreSQL)
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 SaaS Hub API running on http://localhost:${PORT}`);
        console.log(`📦 API endpoints at http://localhost:${PORT}/api`);
        console.log(`🗄️  Database: PostgreSQL via Prisma`);
    });
}

module.exports = app;
