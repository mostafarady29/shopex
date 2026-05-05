const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

// Helper to create a server on a random port
async function createServer() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  return { server, port: server.address().port };
}

// ─── GET /api/products ────────────────────────────────────────
test('Products List - Returns paginated products', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.products), 'products should be an array');
    assert.ok(data.pagination, 'should have pagination');
    assert.ok(data.pagination.total > 0, 'should have products in DB');
  } finally {
    server.close();
  }
});

test('Products List - Category filter works', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products?category=Electronics`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    // All returned products should be in the Electronics category
    for (const p of data.products) {
      assert.ok(
        p.category.toLowerCase().includes('electronics'),
        `Product "${p.name}" should be in Electronics category, got "${p.category}"`
      );
    }
  } finally {
    server.close();
  }
});

test('Products List - Search filter works', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products?search=Fisher`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    if (data.products.length > 0) {
      for (const p of data.products) {
        assert.ok(
          p.name.toLowerCase().includes('fisher'),
          `Product name should contain "fisher", got "${p.name}"`
        );
      }
    }
  } finally {
    server.close();
  }
});

test('Products List - Price filter works', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products?minPrice=10&maxPrice=50`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    for (const p of data.products) {
      assert.ok(p.price >= 10, `Price ${p.price} should be >= 10`);
      assert.ok(p.price <= 50, `Price ${p.price} should be <= 50`);
    }
  } finally {
    server.close();
  }
});

test('Products List - Sort by price-low works', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products?sort=price-low&limit=5`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    for (let i = 1; i < data.products.length; i++) {
      assert.ok(
        data.products[i].price >= data.products[i - 1].price,
        'Products should be sorted by price ascending'
      );
    }
  } finally {
    server.close();
  }
});

test('Products List - minRating filter works', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products?minRating=4`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    for (const p of data.products) {
      assert.ok(p.rating >= 4, `Rating ${p.rating} should be >= 4`);
    }
  } finally {
    server.close();
  }
});

test('Products List - Brand filter works', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products?brand=Samsung`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    for (const p of data.products) {
      assert.strictEqual(p.brand, 'Samsung', `Brand should be Samsung, got "${p.brand}"`);
    }
  } finally {
    server.close();
  }
});

test('Products List - Pagination works', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products?page=2&limit=5`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.pagination.page, 2);
    assert.strictEqual(data.pagination.limit, 5);
    assert.ok(data.products.length <= 5, 'Should return at most 5 products');
  } finally {
    server.close();
  }
});

// ─── GET /api/products/filters ────────────────────────────────
test('Products Filters - Returns categories and brands', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products/filters`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.categories), 'categories should be an array');
    assert.ok(data.categories.length > 0, 'should have at least one category');
    assert.ok(Array.isArray(data.brands), 'brands should be an array');
    assert.ok(data.brands.length > 0, 'should have at least one brand after population');
  } finally {
    server.close();
  }
});

// ─── GET /api/products/:id ───────────────────────────────────
test('Products Single - Returns 404 for non-existent product', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/products/00000000-0000-0000-0000-000000000000`);
    const data = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
  } finally {
    server.close();
  }
});

test('Products Single - Returns valid product by ID', async (t) => {
  const { server, port } = await createServer();
  try {
    // First get a real product ID
    const listRes = await fetch(`http://localhost:${port}/api/products?limit=1`);
    const listData = await listRes.json();
    const productId = listData.products[0].id;

    const res = await fetch(`http://localhost:${port}/api/products/${productId}`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.product, 'should return product object');
    assert.strictEqual(data.product.id, productId);
  } finally {
    server.close();
  }
});
