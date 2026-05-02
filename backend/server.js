const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
const connectDB = require('./config/db');
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Modular Route files
const authRoutes = require('./modules/auth/auth.routes');
const affiliateRoutes = require('./modules/affiliate/affiliate.routes');
const productRoutes = require('./modules/product/product.routes');
const orderRoutes = require('./modules/order/order.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const aiRoutes = require('./modules/ai/ai.routes');

app.use('/api/auth', authRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// File upload route
const upload = require('./middleware/upload');
app.post('/api/upload', upload.array('images', 5), (req, res) => {
    try {
        const files = req.files.map(file => `/uploads/${file.filename}`);
        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Error handler
app.use(require('./middleware/errorHandler'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Initialize Background Workers
require('./jobs/worker');

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
