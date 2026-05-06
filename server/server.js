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
app.use('/api/stock-checker', require('./routes/stock-checker'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/newsletter', require('./routes/newsletter'));

// Base API route
app.get('/api', (req, res) => {
    res.json({ success: true, message: 'Welcome to ShopEx API v1.0', docs: '/api/health' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'SaaS Hub API is running', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server (no MongoDB - using Prisma/PostgreSQL)
// Start server only if run directly and not in test environment
if (require.main === module && process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 SaaS Hub API running on http://localhost:${PORT}`);
        console.log(`📦 API endpoints at http://localhost:${PORT}/api`);
        console.log(`🗄️  Database: PostgreSQL via Prisma`);
    });
}

module.exports = app;
