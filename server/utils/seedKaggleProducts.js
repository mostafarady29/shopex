const { PrismaClient } = require('@prisma/client');
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const HOME = process.env.HOME;

// ─── Paths to all Kaggle datasets ───
const DATASETS = {
  amazonSales: path.join(HOME, '.cache/kagglehub/datasets/karkavelrajaj/amazon-sales-dataset/versions/1/amazon.csv'),
  promptcloud: path.join(HOME, '.cache/kagglehub/datasets/promptcloud/amazon-product-dataset-2020/versions/1/home/sdf/marketing_sample_for_amazon_com-ecommerce__20200101_20200131__10k_data.csv'),
  lokeshparab: path.join(HOME, '.cache/kagglehub/datasets/lokeshparab/amazon-products-dataset/versions/2'),
  asaniczka:   path.join(HOME, '.cache/kagglehub/datasets/asaniczka/amazon-products-dataset-2023-1-4m-products/versions/17/amazon_products.csv'),
};

// ─── Helpers ───
function parsePrice(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[₹$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseRating(str) {
  if (!str) return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.min(num, 5);
}

function parseCount(str) {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, '').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

function randomStock() {
  return Math.floor(Math.random() * 200) + 5;
}

function parseCsvFile(filePath, opts = {}) {
  return new Promise((resolve, reject) => {
    const records = [];
    const limit = opts.limit || Infinity;
    const stream = fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true }));

    stream.on('data', (row) => {
      if (records.length < limit) records.push(row);
    });
    stream.on('end', () => resolve(records));
    stream.on('error', reject);
  });
}

// ─── Dataset 1: Amazon Sales (karkavelrajaj) — ~1,350 products ───
async function loadAmazonSales() {
  if (!fs.existsSync(DATASETS.amazonSales)) return [];
  console.log('   📦 Loading Amazon Sales dataset...');
  const rows = await parseCsvFile(DATASETS.amazonSales);
  return rows.map((r, i) => {
    const price = parsePrice(r.discounted_price);
    const comparePrice = parsePrice(r.actual_price);
    if (!r.product_name || price <= 0) return null;
    return {
      name: r.product_name.substring(0, 500),
      description: (r.about_product || 'Premium quality product.').substring(0, 5000),
      category: (r.category || 'General').split('|')[0].replace(/&/g, ' & '),
      brand: null,
      price,
      comparePrice: comparePrice > price ? comparePrice : null,
      sku: `AMZ-${r.product_id || i}`,
      stock: randomStock(),
      images: r.img_link ? [r.img_link.trim()] : [],
      status: 'active',
      featured: parseRating(r.rating) >= 4.5,
      rating: parseRating(r.rating),
      reviewCount: parseCount(r.rating_count),
    };
  }).filter(Boolean);
}

// ─── Dataset 2: PromptCloud 10K ───
async function loadPromptCloud() {
  if (!fs.existsSync(DATASETS.promptcloud)) return [];
  console.log('   📦 Loading PromptCloud 10K dataset...');
  const rows = await parseCsvFile(DATASETS.promptcloud);
  return rows.map((r, i) => {
    const price = parsePrice(r['Selling Price']) || parsePrice(r['List Price']);
    if (!r['Product Name'] || price <= 0) return null;
    const listPrice = parsePrice(r['List Price']);
    const images = r['Image'] ? r['Image'].split('|').map(u => u.trim()).filter(Boolean).slice(0, 3) : [];
    return {
      name: r['Product Name'].substring(0, 500),
      description: (r['About Product'] || r['Product Description'] || 'Quality product.').substring(0, 5000),
      category: (r['Category'] || 'General').split('|')[0].split('>')[0].trim(),
      brand: r['Brand Name'] || null,
      price,
      comparePrice: listPrice > price ? listPrice : null,
      sku: r['Sku'] || `PC-${r['Uniq Id'] || i}`,
      stock: randomStock(),
      images,
      status: 'active',
      featured: false,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      reviewCount: Math.floor(Math.random() * 500),
    };
  }).filter(Boolean);
}

// ─── Dataset 3: LokeshParab multi-category (~140 CSV files) ───
async function loadLokeshParab() {
  if (!fs.existsSync(DATASETS.lokeshparab)) return [];
  console.log('   📦 Loading LokeshParab multi-category dataset (max 5,000)...');
  const files = fs.readdirSync(DATASETS.lokeshparab).filter(f => f.endsWith('.csv'));
  const MAX_LP = 5000;
  const all = [];
  for (const file of files) {
    if (all.length >= MAX_LP) break;
    try {
      const rows = await parseCsvFile(path.join(DATASETS.lokeshparab, file));
      const categoryName = file.replace('.csv', '');
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const price = parsePrice(r.discount_price) || parsePrice(r.actual_price);
        if (!r.name || price <= 0) continue;
        if (all.length >= MAX_LP) break;
        const actualPrice = parsePrice(r.actual_price);
        all.push({
          name: r.name.substring(0, 500),
          description: `${r.name}. Category: ${categoryName}. ${r.sub_category || ''}`.substring(0, 5000),
          category: r.main_category || categoryName,
          brand: null,
          price,
          comparePrice: actualPrice > price ? actualPrice : null,
          sku: `LP-${categoryName.substring(0, 8)}-${i}`,
          stock: randomStock(),
          images: r.image ? [r.image.trim()] : [],
          status: 'active',
          featured: parseRating(r.ratings) >= 4.5,
          rating: parseRating(r.ratings),
          reviewCount: parseCount(r.no_of_ratings),
        });
      }
    } catch { /* skip bad files */ }
  }
  return all;
}

// ─── Dataset 4: Asaniczka 1.4M (take first 10,000) ───
async function loadAsaniczka() {
  if (!fs.existsSync(DATASETS.asaniczka)) return [];
  console.log('   📦 Loading Asaniczka dataset (first 10,000 of 1.4M)...');
  const rows = await parseCsvFile(DATASETS.asaniczka, { limit: 10000 });
  // Load categories
  const catPath = path.join(path.dirname(DATASETS.asaniczka), 'amazon_categories.csv');
  const catMap = {};
  if (fs.existsSync(catPath)) {
    const cats = await parseCsvFile(catPath);
    cats.forEach(c => { catMap[c.id] = c.category_name; });
  }
  return rows.map((r, i) => {
    const price = parsePrice(r.price);
    if (!r.title || price <= 0) return null;
    const listPrice = parsePrice(r.listPrice);
    return {
      name: r.title.substring(0, 500),
      description: `${r.title}`.substring(0, 5000),
      category: catMap[r.category_id] || 'General',
      brand: null,
      price,
      comparePrice: listPrice > price ? listPrice : null,
      sku: `AZ23-${r.asin || i}`,
      stock: randomStock(),
      images: r.imgUrl ? [r.imgUrl.trim()] : [],
      status: 'active',
      featured: r.isBestSeller === 'True',
      rating: parseRating(r.stars),
      reviewCount: parseCount(r.reviews),
    };
  }).filter(Boolean);
}

// ─── Main ───
async function seed() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  🛒 Mega Kaggle Product Seeder (4 Datasets)  ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log();
  console.log('📥 Loading datasets...');

  // Test DB connection first
  try {
    await prisma.$connect();
    console.log('   ✅ Database connected!\n');
  } catch (err) {
    console.error('❌ Cannot reach database:', err.message);
    process.exit(1);
  }

  const [d1, d2, d3, d4] = await Promise.all([
    loadAmazonSales(),
    loadPromptCloud(),
    loadLokeshParab(),
    loadAsaniczka(),
  ]);

  console.log(`   ✅ Amazon Sales:     ${d1.length} products`);
  console.log(`   ✅ PromptCloud 10K:  ${d2.length} products`);
  console.log(`   ✅ LokeshParab:      ${d3.length} products`);
  console.log(`   ✅ Asaniczka 1.4M:   ${d4.length} products`);

  // Merge & deduplicate by SKU
  const allProducts = [...d1, ...d2, ...d3, ...d4];
  const seenSkus = new Set();
  const unique = [];
  for (const p of allProducts) {
    if (!seenSkus.has(p.sku)) {
      seenSkus.add(p.sku);
      unique.push(p);
    }
  }

  console.log(`\n📊 Total unique products: ${unique.length}`);

  // Clear existing products
  console.log('\n🗑️  Clearing existing products...');
  await prisma.wishlistItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('   Done.');

  // Insert in batches
  const BATCH_SIZE = 100;
  let inserted = 0;
  console.log(`\n📤 Inserting ${unique.length} products (batch size: ${BATCH_SIZE})...\n`);

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    try {
      const result = await prisma.product.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += result.count;
    } catch (err) {
      console.error(`\n⚠️  Batch error at index ${i}: ${err.message.substring(0, 120)}`);
    }
    const pct = Math.round(((i + batch.length) / unique.length) * 100);
    process.stdout.write(`\r   Progress: ${pct}% — ${inserted} products inserted`);
  }

  console.log(`\n\n🎉 Successfully seeded ${inserted} products into PostgreSQL!`);
  console.log(`   Database: ${(process.env.DATABASE_URL || '').split('@')[1]?.split('/')[0] || 'local'}`);

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  prisma.$disconnect();
  process.exit(1);
});
