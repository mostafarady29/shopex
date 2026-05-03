const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Fetching products from DummyJSON...');
    const response = await fetch('https://dummyjson.com/products?limit=100');
    const data = await response.json();
    
    console.log(`Fetched ${data.products.length} products. Formatting...`);
    
    const productsToInsert = data.products.map(p => ({
      name: p.title,
      description: p.description,
      category: p.category,
      brand: p.brand || 'Generic',
      price: p.price,
      comparePrice: p.discountPercentage ? p.price / (1 - p.discountPercentage / 100) : null,
      sku: p.sku || ('DUMMY-' + p.id + '-' + Math.floor(Math.random() * 10000)),
      stock: p.stock,
      images: p.images && p.images.length > 0 ? p.images : [p.thumbnail],
      status: 'active',
      featured: p.rating >= 4.5,
      rating: p.rating,
      reviewCount: p.reviews ? p.reviews.length : Math.floor(Math.random() * 100)
    }));

    console.log('Inserting into database via Prisma...');
    const result = await prisma.product.createMany({
      data: productsToInsert,
      skipDuplicates: true
    });

    console.log(`Successfully inserted ${result.count} products!`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
