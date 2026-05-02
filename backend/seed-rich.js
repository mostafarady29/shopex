const prisma = require('./config/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Helper: random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: random element from array
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Helper: random number between min and max
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seed() {
  console.log('🗑️  Clearing old data...');
  await prisma.referral.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.affiliate.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Password123', salt);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  console.log('👤 Creating users...');

  // Admin
  const admin = await prisma.user.create({
    data: { firstName: 'Mostafa', lastName: 'Admin', email: 'admin@shopex.com', password: hash, role: 'admin', createdAt: oneYearAgo }
  });

  // Customers (20)
  const customerNames = [
    ['Ahmed', 'Hassan'], ['Sara', 'Mohamed'], ['Omar', 'Ali'], ['Nour', 'Ibrahim'],
    ['Youssef', 'Khaled'], ['Mona', 'Saeed'], ['Karim', 'Farouk'], ['Layla', 'Mahmoud'],
    ['Tarek', 'Nabil'], ['Dina', 'Ragheb'], ['Hassan', 'Youssef'], ['Fatma', 'Adel'],
    ['Ali', 'Gomaa'], ['Rania', 'Salah'], ['Mohamed', 'Tamer'], ['Hana', 'Sherif'],
    ['Khaled', 'Amr'], ['Yasmin', 'Hossam'], ['Amr', 'Fathy'], ['Salma', 'Reda']
  ];

  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
    const [fn, ln] = customerNames[i];
    const c = await prisma.user.create({
      data: {
        firstName: fn, lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com`,
        password: hash, role: 'customer', phone: `+20${rand(100, 999)}${rand(100, 999)}${rand(1000, 9999)}`,
        city: pick(['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta']),
        country: 'Egypt',
        createdAt: randomDate(oneYearAgo, now)
      }
    });
    customers.push(c);
  }

  // Affiliate Users (5)
  const affNames = [
    ['Sara', 'Affiliate'], ['Mohamed', 'Marketer'], ['Nadia', 'Creator'],
    ['Ayman', 'Influencer'], ['Lina', 'Blogger']
  ];

  const affiliateUsers = [];
  const affiliates = [];
  const codes = ['SARA2026', 'MOMO10', 'NADIA15', 'AYMAN20', 'LINA25'];
  const rates = [10, 8, 15, 12, 10];

  for (let i = 0; i < affNames.length; i++) {
    const [fn, ln] = affNames[i];
    const u = await prisma.user.create({
      data: {
        firstName: fn, lastName: ln,
        email: `${fn.toLowerCase()}@shopex-affiliate.com`,
        password: hash, role: 'affiliate',
        createdAt: randomDate(oneYearAgo, new Date(now.getTime() - 90 * 86400000))
      }
    });
    affiliateUsers.push(u);

    const aff = await prisma.affiliate.create({
      data: {
        userId: u.id, referralCode: codes[i],
        commissionRate: rates[i], status: 'active',
        createdAt: u.createdAt
      }
    });
    affiliates.push(aff);

    await prisma.wallet.create({
      data: { affiliateId: aff.id, balance: 0, pendingBalance: 0 }
    });
  }

  console.log(`✅ ${customers.length} customers + ${affiliates.length} affiliates created`);

  // Products (15)
  console.log('📦 Creating products...');
  const productData = [
    { name: 'Sony WH-1000XM5', description: 'Industry-leading noise canceling headphones with Auto NC Optimizer.', category: 'Electronics', brand: 'Sony', price: 349.99, comparePrice: 399.99, sku: 'SONY-WH1000XM5', stock: 150, featured: true, commissionRate: 12 },
    { name: 'MacBook Pro 16" M4 Pro', description: 'Most advanced Mac laptop. M4 Pro chip, 48GB RAM, 1TB SSD.', category: 'Electronics', brand: 'Apple', price: 2499.99, comparePrice: 2699.99, sku: 'APPLE-MBP16-M4', stock: 45, featured: true, commissionRate: 5 },
    { name: 'Nike Air Max 270', description: 'Iconic lifestyle sneaker with Max Air unit for all-day comfort.', category: 'Fashion', brand: 'Nike', price: 159.99, comparePrice: 189.99, sku: 'NIKE-AM270', stock: 320, featured: false, commissionRate: 8 },
    { name: 'Samsung Galaxy S25 Ultra', description: 'Ultimate Galaxy with AI camera, S Pen, titanium design.', category: 'Electronics', brand: 'Samsung', price: 1299.99, comparePrice: 1399.99, sku: 'SAMSUNG-S25U', stock: 200, featured: true, commissionRate: 7 },
    { name: 'Dyson V15 Detect', description: 'Intelligent cordless vacuum with laser dust detection.', category: 'Home', brand: 'Dyson', price: 749.99, sku: 'DYSON-V15', stock: 80, featured: false, commissionRate: 10 },
    { name: 'iPad Air M2', description: '11-inch Liquid Retina, M2 chip, all-day battery.', category: 'Electronics', brand: 'Apple', price: 599.99, comparePrice: 649.99, sku: 'APPLE-IPAD-AIR', stock: 120, featured: true, commissionRate: 6 },
    { name: 'Adidas Ultraboost 23', description: 'Premium running shoe with BOOST midsole technology.', category: 'Fashion', brand: 'Adidas', price: 189.99, comparePrice: 219.99, sku: 'ADIDAS-UB23', stock: 250, featured: false, commissionRate: 9 },
    { name: 'Logitech MX Master 3S', description: 'Advanced wireless mouse with 8K DPI and quiet clicks.', category: 'Electronics', brand: 'Logitech', price: 99.99, sku: 'LOG-MX3S', stock: 400, featured: false, commissionRate: 10 },
    { name: 'Keychron K2 Pro', description: 'Wireless mechanical keyboard with hot-swappable switches.', category: 'Electronics', brand: 'Keychron', price: 89.99, comparePrice: 109.99, sku: 'KEYCHRON-K2P', stock: 180, featured: false, commissionRate: 12 },
    { name: 'AirPods Pro 2', description: 'Active Noise Cancellation, Adaptive Audio, USB-C.', category: 'Electronics', brand: 'Apple', price: 249.99, sku: 'APPLE-APP2', stock: 300, featured: true, commissionRate: 6 },
    { name: 'Levi\'s 501 Original', description: 'The original jean. Straight fit, button fly, iconic.', category: 'Fashion', brand: 'Levi\'s', price: 79.99, comparePrice: 98.00, sku: 'LEVIS-501', stock: 500, featured: false, commissionRate: 8 },
    { name: 'Philips Hue Starter Kit', description: 'Smart lighting starter kit with bridge and 3 bulbs.', category: 'Home', brand: 'Philips', price: 129.99, comparePrice: 159.99, sku: 'PHILIPS-HUE', stock: 150, featured: false, commissionRate: 10 },
    { name: 'Kindle Paperwhite', description: '6.8" display, adjustable warm light, waterproof.', category: 'Electronics', brand: 'Amazon', price: 139.99, sku: 'AMZN-KINDLE', stock: 220, featured: false, commissionRate: 8 },
    { name: 'PlayStation 5 Slim', description: 'Next-gen gaming console with 1TB SSD.', category: 'Electronics', brand: 'Sony', price: 449.99, comparePrice: 499.99, sku: 'SONY-PS5S', stock: 60, featured: true, commissionRate: 5 },
    { name: 'Instant Pot Duo 7-in-1', description: 'Multi-cooker: pressure cook, slow cook, steam, sauté.', category: 'Home', brand: 'Instant Pot', price: 89.99, comparePrice: 119.99, sku: 'INSTPOT-DUO', stock: 350, featured: false, commissionRate: 12 },
  ];

  const products = [];
  for (const p of productData) {
    const product = await prisma.product.create({
      data: {
        ...p,
        images: [`https://images.unsplash.com/photo-${rand(1500000000000, 1700000000000)}?w=800`],
        status: 'active', rating: 0, reviewCount: 0,
        createdAt: randomDate(oneYearAgo, new Date(now.getTime() - 60 * 86400000))
      }
    });
    products.push(product);
  }
  console.log(`✅ ${products.length} products created`);

  // Orders (80 orders spread across the year)
  console.log('🛒 Creating orders...');
  const allBuyers = [...customers, ...affiliateUsers];
  const statuses = ['paid', 'paid', 'paid', 'shipped', 'delivered', 'delivered', 'delivered'];
  const cities = ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta', 'Aswan', 'Luxor'];
  let totalReferralsPending = 0;
  let totalReferralsAvailable = 0;

  for (let i = 0; i < 80; i++) {
    const buyer = pick(allBuyers);
    const orderDate = randomDate(oneYearAgo, now);
    const numItems = rand(1, 4);
    const orderProducts = [];

    // Pick random unique products
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numItems; j++) {
      orderProducts.push({ product: shuffled[j], quantity: rand(1, 3) });
    }

    let subtotal = 0;
    const items = orderProducts.map(op => {
      const itemTotal = op.product.price * op.quantity;
      subtotal += itemTotal;
      return {
        productId: op.product.id,
        name: op.product.name,
        quantity: op.quantity,
        price: op.product.price
      };
    });

    const tax = +(subtotal * 0.15).toFixed(2);
    const shipping = subtotal > 100 ? 0 : 10;
    const total = +(subtotal + tax + shipping).toFixed(2);
    const city = pick(cities);

    // 40% chance of affiliate referral
    const useReferral = Math.random() < 0.4;
    let chosenAffiliate = null;
    let commissionAmount = 0;

    if (useReferral) {
      chosenAffiliate = pick(affiliates);
      // Make sure it's not self-referral
      if (chosenAffiliate.userId !== buyer.id) {
        orderProducts.forEach(op => {
          const rate = op.product.commissionRate || chosenAffiliate.commissionRate;
          commissionAmount += (op.product.price * op.quantity) * (rate / 100);
        });
        commissionAmount = +commissionAmount.toFixed(2);
      } else {
        chosenAffiliate = null;
      }
    }

    const order = await prisma.order.create({
      data: {
        orderId: `ORD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        userId: buyer.id,
        shipFirstName: buyer.firstName,
        shipLastName: buyer.lastName,
        shipEmail: buyer.email,
        shipPhone: `+20${rand(100,999)}${rand(1000,9999)}`,
        shipStreet: `${rand(1, 200)} ${pick(['Tahrir St', 'Nile Ave', 'Salah Salem', 'Corniche'])}`,
        shipCity: city,
        shipPostalCode: `${rand(10000, 99999)}`,
        shipCountry: 'Egypt',
        paymentMethod: pick(['credit_card', 'debit_card', 'cash_on_delivery']),
        subtotal, tax, shipping, total,
        status: pick(statuses),
        createdAt: orderDate,
        updatedAt: orderDate,
        items: { create: items }
      }
    });

    // Create referral if applicable
    if (chosenAffiliate && commissionAmount > 0) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      const refStatus = orderDate < thirtyDaysAgo ? 'available' : 'pending';

      await prisma.referral.create({
        data: {
          affiliateId: chosenAffiliate.id,
          orderId: order.id,
          commissionAmount,
          status: refStatus,
          createdAt: orderDate
        }
      });

      if (refStatus === 'pending') {
        totalReferralsPending += commissionAmount;
        await prisma.wallet.update({
          where: { affiliateId: chosenAffiliate.id },
          data: { pendingBalance: { increment: commissionAmount } }
        });
      } else {
        totalReferralsAvailable += commissionAmount;
        await prisma.wallet.update({
          where: { affiliateId: chosenAffiliate.id },
          data: { balance: { increment: commissionAmount } }
        });
      }
    }
  }
  console.log(`✅ 80 orders created`);

  // Reviews (60 reviews)
  console.log('⭐ Creating reviews...');
  const comments = [
    'Excellent product! Exceeded my expectations.',
    'Great quality for the price. Would buy again.',
    'Good but shipping was a bit slow.',
    'Amazing! Best purchase this year.',
    'Decent product, nothing special.',
    'Love it! Perfect for daily use.',
    'Not bad, but expected more from this brand.',
    'Fantastic build quality and design.',
    'Arrived damaged but replacement was quick.',
    'Five stars! Highly recommend to everyone.',
    'Works perfectly. Very happy with it.',
    'The quality is outstanding. Worth every penny.',
  ];

  for (let i = 0; i < 60; i++) {
    const product = pick(products);
    const user = pick(customers);
    const rating = rand(3, 5); // Mostly positive

    await prisma.review.create({
      data: {
        rating,
        comment: pick(comments),
        productId: product.id,
        userId: user.id,
        createdAt: randomDate(oneYearAgo, now)
      }
    });
  }

  // Update product ratings
  for (const product of products) {
    const reviews = await prisma.review.findMany({ where: { productId: product.id } });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: { rating: +avgRating.toFixed(1), reviewCount: reviews.length }
      });
    }
  }
  console.log(`✅ 60 reviews created & product ratings updated`);

  // Summary
  const totalOrders = await prisma.order.count();
  const totalRevenue = await prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ['paid', 'shipped', 'delivered'] } } });
  const totalReferrals = await prisma.referral.count();
  const totalUsers = await prisma.user.count();

  console.log('\n🎉 Rich Seeding Complete!\n');
  console.log('══════════════════════════════════════════');
  console.log(`  👤 Users:      ${totalUsers} (1 admin + 20 customers + 5 affiliates)`);
  console.log(`  📦 Products:   ${products.length}`);
  console.log(`  🛒 Orders:     ${totalOrders}`);
  console.log(`  💰 Revenue:    $${(totalRevenue._sum.total || 0).toFixed(2)}`);
  console.log(`  🔗 Referrals:  ${totalReferrals}`);
  console.log(`  ⭐ Reviews:    60`);
  console.log('══════════════════════════════════════════');
  console.log('  LOGIN: Password123 for all accounts');
  console.log('  Admin:     admin@shopex.com');
  console.log('  Customer:  ahmed.hassan@gmail.com');
  console.log('  Affiliate: sara@shopex-affiliate.com');
  console.log('══════════════════════════════════════════\n');
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
