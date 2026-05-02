const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

const seedDB = async () => {
    try {
        console.log('🗄️  Connecting to PostgreSQL via Prisma...');

        // Clear existing data (order matters for foreign keys)
        await prisma.referral.deleteMany({});
        await prisma.orderItem.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('🗑️  Cleared existing data');

        const hashedPassword = await bcrypt.hash('pass123', 12);

        // Create users
        const users = await Promise.all([
            prisma.user.create({
                data: {
                    firstName: 'John', lastName: 'Doe',
                    email: 'user@shopex.com', password: hashedPassword, role: 'customer'
                }
            }),
            prisma.user.create({
                data: {
                    firstName: 'Sarah', lastName: 'Affiliate',
                    email: 'affiliate@shopex.com', password: hashedPassword, role: 'customer'
                }
            }),
            prisma.user.create({
                data: {
                    firstName: 'Mike', lastName: 'Mod',
                    email: 'mod@shopex.com', password: hashedPassword, role: 'moderator'
                }
            }),
            prisma.user.create({
                data: {
                    firstName: 'Admin', lastName: 'Boss',
                    email: 'admin@shopex.com', password: hashedPassword, role: 'admin'
                }
            }),
        ]);
        console.log('👥 Created demo users');

        // Create products
        const products = await Promise.all([
            prisma.product.create({
                data: {
                    name: 'Ultra Pro Max 5G Smartphone',
                    description: 'Flagship 5G smartphone with 512GB storage, advanced 3nm chip, 48MP camera system, and 29-hour battery life.',
                    category: 'Electronics',
                    brand: 'Teko Corp',
                    price: 1200.00,
                    comparePrice: 1380.00,
                    stock: 50,
                    images: [
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuAmU_BR-8dngIIU7pbzWwUJKrdNhUUo0Hx57d_A01Q0KDgQmSaN2IeVA9ko6G1tDZJItdpGDbRQKf3fotza29odjjaTqlIExxHKekNgA9xk-VotcH-xNcFB7x5V4qhcVae3Rt1kKcUxBkd56msqszckYZu6CJDqqPE5ijQFWJd0ucVLilo77xogopqtyWq_kIRj2tv_2Gb6jVoNu2YMDAvf0FY8_XXRXjIEmUoMvLhY1vt2X7mUrfYVPmmMbMapVmB_J1tsPplJVkQ'
                    ],
                    featured: true,
                    rating: 4.8,
                    reviewCount: 1284,
                    status: 'active'
                }
            }),
            prisma.product.create({
                data: {
                    name: 'SaaS CRM Pro',
                    description: 'Intelligent CRM driving revenue and growth. Manage contacts, track deals, and automate follow-ups.',
                    category: 'Subscriptions',
                    price: 99.99,
                    stock: 999,
                    images: [],
                    featured: true,
                    rating: 4.9,
                    reviewCount: 245,
                    status: 'active'
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Landing Page Builder',
                    description: 'Drag-and-drop landing page creator with 50+ premium templates.',
                    category: 'Templates',
                    price: 79.99,
                    stock: 999,
                    images: [],
                    rating: 4.8,
                    reviewCount: 156,
                    status: 'active'
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Email Marketing Plugin',
                    description: 'Automated email sequences, A/B testing, and detailed analytics.',
                    category: 'Plugins',
                    price: 49.99,
                    stock: 999,
                    images: [],
                    rating: 4.7,
                    reviewCount: 89,
                    status: 'active'
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Advanced Analytics Dashboard',
                    description: 'Real-time metrics, funnel tracking, and conversion optimization tools.',
                    category: 'Plugins',
                    price: 199.99,
                    comparePrice: 249.99,
                    stock: 999,
                    images: [],
                    rating: 4.6,
                    reviewCount: 67,
                    status: 'active'
                }
            }),
            prisma.product.create({
                data: {
                    name: 'Cloud Storage Suite',
                    description: 'Secure cloud storage with team collaboration, versioning, and API access.',
                    category: 'Subscriptions',
                    price: 29.99,
                    stock: 999,
                    images: [],
                    rating: 4.5,
                    reviewCount: 203,
                    status: 'active'
                }
            }),
        ]);
        console.log('📦 Created demo products');

        // Create sample orders
        const orderId1 = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const orderId2 = 'ORD-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        await prisma.order.create({
            data: {
                orderId: orderId1,
                userId: users[0].id,
                shipFirstName: 'John', shipLastName: 'Doe',
                shipEmail: 'user@saashub.com', shipPhone: '+20123456789',
                shipStreet: '123 Main St', shipCity: 'Cairo',
                shipPostalCode: '11511', shipCountry: 'Egypt',
                paymentMethod: 'credit_card',
                subtotal: 99.99, shipping: 0, tax: 14.00, total: 113.99,
                status: 'completed',
                items: {
                    create: [{
                        productId: products[1].id,
                        name: 'SaaS CRM Pro',
                        quantity: 1,
                        price: 99.99
                    }]
                }
            }
        });

        await prisma.order.create({
            data: {
                orderId: orderId2,
                userId: users[0].id,
                shipFirstName: 'John', shipLastName: 'Doe',
                shipEmail: 'user@saashub.com', shipPhone: '+20123456789',
                shipStreet: '123 Main St', shipCity: 'Cairo',
                shipPostalCode: '11511', shipCountry: 'Egypt',
                paymentMethod: 'credit_card',
                subtotal: 199.99, shipping: 0, tax: 28.00, total: 227.99,
                status: 'processing',
                items: {
                    create: [{
                        productId: products[4].id,
                        name: 'Advanced Analytics Dashboard',
                        quantity: 1,
                        price: 199.99
                    }]
                }
            }
        });
        console.log('🛒 Created demo orders');

        // Create sample reviews
        await prisma.review.create({
            data: {
                rating: 5,
                comment: 'Best phone I\'ve ever used. The camera is legendary, and the battery lasts for a very long time even with heavy usage.',
                productId: products[0].id,
                userId: users[0].id
            }
        });

        await prisma.review.create({
            data: {
                rating: 4,
                comment: 'Great design but the price is high. The device performance and design are spotless.',
                productId: products[0].id,
                userId: users[1].id
            }
        });
        console.log('⭐ Created demo reviews');

        // Create sample referrals
        await prisma.referral.create({
            data: {
                affiliateUserId: users[1].id,
                referredUserId: users[0].id,
                code: 'SA-' + users[1].id.slice(0, 5).toUpperCase(),
                commission: 11.40,
                status: 'converted'
            }
        });
        console.log('🔗 Created demo referrals');

        console.log('\n✅ Database seeded successfully!\n');
        console.log('Demo accounts:');
        console.log('─────────────────────────────────────');
        console.log('Customer:  user@saashub.com / pass123');
        console.log('Affiliate: affiliate@saashub.com / pass123');
        console.log('Moderator: mod@saashub.com / pass123');
        console.log('Admin:     admin@saashub.com / pass123');
        console.log('─────────────────────────────────────\n');

        await prisma.$disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        await prisma.$disconnect();
        process.exit(1);
    }
};

seedDB();
