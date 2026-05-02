const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function seed() {
  console.log('🌱 Seeding database...');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123', salt);

  // 1. Admin User
  const admin = await prisma.user.create({
    data: {
      firstName: 'Mostafa',
      lastName: 'Admin',
      email: 'admin@shopex.com',
      password: hashedPassword,
      role: 'admin',
    }
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Affiliate User
  const affiliateUser = await prisma.user.create({
    data: {
      firstName: 'Sara',
      lastName: 'Affiliate',
      email: 'affiliate@shopex.com',
      password: hashedPassword,
      role: 'affiliate',
    }
  });

  const affiliate = await prisma.affiliate.create({
    data: {
      userId: affiliateUser.id,
      referralCode: 'SARA2026',
      commissionRate: 10.0,
      status: 'active',
    }
  });

  await prisma.wallet.create({
    data: {
      affiliateId: affiliate.id,
      balance: 428.50,
      pendingBalance: 125.00,
    }
  });
  console.log('✅ Affiliate created:', affiliateUser.email);

  // 3. Customer User
  const customer = await prisma.user.create({
    data: {
      firstName: 'Ahmed',
      lastName: 'Customer',
      email: 'customer@shopex.com',
      password: hashedPassword,
      role: 'customer',
    }
  });
  console.log('✅ Customer created:', customer.email);

  // 4. Sample Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise canceling headphones with Auto NC Optimizer and crystal-clear hands-free calling.',
        category: 'Electronics',
        brand: 'Sony',
        price: 349.99,
        comparePrice: 399.99,
        sku: 'SONY-WH1000XM5',
        stock: 150,
        images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'],
        status: 'active',
        featured: true,
        rating: 4.8,
        reviewCount: 2341,
        commissionRate: 12.0,
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16" M4 Pro',
        description: 'The most advanced Mac laptop for demanding workflows. M4 Pro chip, 48GB RAM, 1TB SSD.',
        category: 'Electronics',
        brand: 'Apple',
        price: 2499.99,
        comparePrice: 2699.99,
        sku: 'APPLE-MBP16-M4',
        stock: 45,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
        status: 'active',
        featured: true,
        rating: 4.9,
        reviewCount: 876,
        commissionRate: 5.0,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Nike Air Max 270',
        description: 'Iconic lifestyle sneaker featuring the first-ever Max Air unit designed for all-day comfort.',
        category: 'Fashion',
        brand: 'Nike',
        price: 159.99,
        comparePrice: 189.99,
        sku: 'NIKE-AM270-BLK',
        stock: 320,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
        status: 'active',
        featured: false,
        rating: 4.5,
        reviewCount: 1203,
        commissionRate: 8.0,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S25 Ultra',
        description: 'The ultimate Galaxy experience with AI-powered camera, S Pen, and titanium design.',
        category: 'Electronics',
        brand: 'Samsung',
        price: 1299.99,
        comparePrice: 1399.99,
        sku: 'SAMSUNG-S25U',
        stock: 200,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'],
        status: 'active',
        featured: true,
        rating: 4.7,
        reviewCount: 542,
        commissionRate: 7.0,
      }
    }),
    prisma.product.create({
      data: {
        name: 'Dyson V15 Detect',
        description: 'Intelligent cordless vacuum with laser dust detection and LCD screen showing real-time data.',
        category: 'Home',
        brand: 'Dyson',
        price: 749.99,
        sku: 'DYSON-V15-DET',
        stock: 80,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800'],
        status: 'active',
        featured: false,
        rating: 4.6,
        reviewCount: 389,
        commissionRate: 10.0,
      }
    }),
  ]);
  console.log(`✅ ${products.length} products created`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('──────────────────────────────────────');
  console.log('  LOGIN CREDENTIALS (password for all: Password123)');
  console.log('──────────────────────────────────────');
  console.log('  Admin:     admin@shopex.com');
  console.log('  Affiliate: affiliate@shopex.com');
  console.log('  Customer:  customer@shopex.com');
  console.log('──────────────────────────────────────\n');
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
