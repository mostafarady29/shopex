// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Prisma unique constraint violation
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Prisma validation error
    if (err.name === 'PrismaClientValidationError') {
        return res.status(400).json({ success: false, message: 'Invalid data provided' });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
};

module.exports = errorHandler;
