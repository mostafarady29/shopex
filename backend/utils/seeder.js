const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();

        console.log('Data cleared...'.red.inverse);

        // Create admin user
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@shophub.com',
            password: 'admin123',
            role: 'admin',
            phone: '+1234567890'
        });

        // Create customer user
        const customer = await User.create({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'customer',
            phone: '+1234567891'
        });

        console.log('Users created...'.green.inverse);

        // Create products
        const products = await Product.insertMany([
            {
                name: 'Premium Wireless Headphones',
                description: 'Experience premium sound quality with active noise cancellation and 30-hour battery life.',
                category: 'Electronics',
                brand: 'AudioTech',
                price: 299.99,
                comparePrice: 399.99,
                sku: 'WH-001',
                stock: 45,
                images: ['/assets/images/product_headphones_1768510726683.png'],
                status: 'active',
                featured: true,
                rating: 4.5,
                reviewCount: 324
            },
            {
                name: 'Smart Watch Pro',
                description: 'Advanced fitness tracking, heart rate monitoring, and smartphone notifications.',
                category: 'Electronics',
                brand: 'TechWear',
                price: 399.99,
                sku: 'SW-002',
                stock: 30,
                images: ['/assets/images/product_smartwatch_1768510745513.png'],
                status: 'active',
                featured: true,
                rating: 4.8,
                reviewCount: 256
            },
            {
                name: 'Ultra Slim Laptop',
                description: 'Powerful performance in a sleek design. Perfect for professionals and students.',
                category: 'Electronics',
                brand: 'CompuTech',
                price: 1299.99,
                sku: 'LP-003',
                stock: 12,
                images: ['/assets/images/product_laptop_1768510763985.png'],
                status: 'active',
                featured: false,
                rating: 4.7,
                reviewCount: 189
            },
            {
                name: 'Professional Camera',
                description: '24MP sensor, 4K video recording, and advanced autofocus system.',
                category: 'Electronics',
                brand: 'PhotoPro',
                price: 1899.99,
                sku: 'CM-004',
                stock: 8,
                images: ['/assets/images/product_camera_1768510785099.png'],
                status: 'active',
                featured: false,
                rating: 4.9,
                reviewCount: 145
            },
            {
                name: 'Athletic Sneakers',
                description: 'Comfortable and stylish sneakers for running and everyday wear.',
                category: 'Fashion',
                brand: 'SportFit',
                price: 129.99,
                comparePrice: 179.99,
                sku: 'SN-005',
                stock: 50,
                images: ['/assets/images/product_sneakers_1768510804610.png'],
                status: 'active',
                featured: false,
                rating: 4.6,
                reviewCount: 412
            },
            {
                name: 'Travel Backpack',
                description: 'Durable and spacious backpack perfect for travel and daily commute.',
                category: 'Fashion',
                brand: 'TravelGear',
                price: 89.99,
                sku: 'BP-006',
                stock: 35,
                images: ['/assets/images/product_backpack_1768510823779.png'],
                status: 'active',
                featured: false,
                rating: 4.4,
                reviewCount: 298
            }
        ]);

        console.log('Products created...'.green.inverse);

        // Create sample order
        await Order.create({
            user: customer._id,
            items: [
                {
                    product: products[0]._id,
                    name: products[0].name,
                    quantity: 1,
                    price: products[0].price
                }
            ],
            shippingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+1234567891',
                street: '123 Main St',
                city: 'New York',
                postalCode: '10001',
                country: 'United States'
            },
            paymentMethod: 'card',
            subtotal: 299.99,
            shipping: 0,
            tax: 29.99,
            total: 329.98,
            status: 'completed'
        });

        console.log('Sample order created...'.green.inverse);

        console.log('Data seeded successfully!'.green.bold);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
