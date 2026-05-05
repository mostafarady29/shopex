const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

async function createServer() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  return { server, port: server.address().port };
}

async function getAuthToken(port, role = 'customer') {
  const email = `testorder_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
  const res = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'OrderTest',
      lastName: 'User',
      email,
      password: 'testpass123',
      role
    })
  });
  const data = await res.json();
  return data.token;
}

async function getProductId(port) {
  const res = await fetch(`http://localhost:${port}/api/products?limit=1`);
  const data = await res.json();
  return data.products[0].id;
}

// ─── ORDERS TESTS ─────────────────────────────────────────────

test('Orders - Unauthenticated access is denied', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/orders/my`);
    assert.strictEqual(res.status, 401);
  } finally {
    server.close();
  }
});

test('Orders - Create order requires items', async (t) => {
  const { server, port } = await createServer();
  try {
    const token = await getAuthToken(port);
    const res = await fetch(`http://localhost:${port}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: [] })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  } finally {
    server.close();
  }
});

test('Orders - Create and retrieve order', async (t) => {
  const { server, port } = await createServer();
  try {
    const token = await getAuthToken(port);
    const productId = await getProductId(port);

    // Create order
    const createRes = await fetch(`http://localhost:${port}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        items: [{ productId, quantity: 1 }],
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          phone: '123456',
          address: '123 Test St',
          city: 'Cairo',
          zip: '12345',
          country: 'EG'
        },
        paymentMethod: 'credit_card'
      })
    });
    const createData = await createRes.json();
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createData.success, true);
    assert.ok(createData.order.orderId.startsWith('ORD-'));
    assert.ok(createData.order.total > 0);

    // Get my orders
    const myRes = await fetch(`http://localhost:${port}/api/orders/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const myData = await myRes.json();
    assert.strictEqual(myRes.status, 200);
    assert.ok(myData.orders.length >= 1);

    // Get single order
    const orderId = createData.order.id;
    const singleRes = await fetch(`http://localhost:${port}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const singleData = await singleRes.json();
    assert.strictEqual(singleRes.status, 200);
    assert.strictEqual(singleData.order.id, orderId);
  } finally {
    server.close();
  }
});

test('Orders - Admin access returns 403 for non-admin', async (t) => {
  const { server, port } = await createServer();
  try {
    const token = await getAuthToken(port, 'customer');
    const res = await fetch(`http://localhost:${port}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 403);
  } finally {
    server.close();
  }
});
