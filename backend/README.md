# Backend API

Complete REST API for E-Commerce Website

## Features

- ✅ User authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Product management (CRUD)
- ✅ Order processing
- ✅ Admin dashboard with statistics
- ✅ File upload for product images
- ✅ Search and filtering
- ✅ Pagination
- ✅ Rate limiting
- ✅ Security headers

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Steps

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `config/config.env.example` to `config/config.env`
- Update the values:
  - `MONGO_URI`: Your MongoDB connection string
  - `JWT_SECRET`: A secure random string
  - `EMAIL_*`: Your email service credentials (for password reset)

3. Seed the database (optional):
```bash
npm run seed
```

This will create:
- Admin user: `admin@shophub.com` / `admin123`
- Customer user: `john@example.com` / `password123`
- 6 sample products
- 1 sample order

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (supports filters, search, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get single order (requires auth)
- `GET /api/orders/user/me` - Get current user's orders (requires auth)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

### File Upload
- `POST /api/upload` - Upload product images (admin only)

## Query Parameters

### Products
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search in name and description
- `sort` - Sort by: `price-low`, `price-high`, `name`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

### Orders
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All errors return JSON in the format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── config.env         # Environment variables
├── models/
│   ├── User.js            # User model
│   ├── Product.js         # Product model
│   ├── Order.js           # Order model
│   └── Review.js          # Review model
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── productController.js
│   ├── orderController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   └── admin.js
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── errorHandler.js    # Error handling
│   └── upload.js          # File upload config
├── utils/
│   ├── generateToken.js   # JWT token generation
│   └── seeder.js          # Database seeder
├── uploads/               # Uploaded files
├── server.js              # Entry point
└── package.json
```

## License

MIT
