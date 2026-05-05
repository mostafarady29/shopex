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

// Helper: register a test user and get token
async function getAuthToken(port) {
  const email = `testcart_${Date.now()}@test.com`;
  const res = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'CartTest',
      lastName: 'User',
      email,
      password: 'testpass123'
    })
  });
  const data = await res.json();
  return data.token;
}

// Helper: get a real product ID
async function getProductId(port) {
  const res = await fetch(`http://localhost:${port}/api/products?limit=1`);
  const data = await res.json();
  return data.products[0].id;
}

// ─── CART TESTS ──────────────────────────────────────────────

test('Cart - Unauthenticated access is denied', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/cart`);
    assert.strictEqual(res.status, 401);
  } finally {
    server.close();
  }
});

test('Cart - Add to cart requires productId', async (t) => {
  const { server, port } = await createServer();
  try {
    const token = await getAuthToken(port);
    const res = await fetch(`http://localhost:${port}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({})
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  } finally {
    server.close();
  }
});

test('Cart - Full lifecycle: add, get, clear', async (t) => {
  const { server, port } = await createServer();
  try {
    const token = await getAuthToken(port);
    const productId = await getProductId(port);

    // Add to cart
    const addRes = await fetch(`http://localhost:${port}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId, quantity: 2 })
    });
    const addData = await addRes.json();
    assert.strictEqual(addRes.status, 200);
    assert.strictEqual(addData.success, true);
    assert.ok(addData.cartItem);
    assert.strictEqual(addData.cartItem.quantity, 2);

    // Get cart
    const getRes = await fetch(`http://localhost:${port}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getData = await getRes.json();
    assert.strictEqual(getRes.status, 200);
    assert.ok(getData.cartItems.length >= 1);

    // Get cart count
    const countRes = await fetch(`http://localhost:${port}/api/cart/count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const countData = await countRes.json();
    assert.strictEqual(countRes.status, 200);
    assert.ok(countData.count >= 2);

    // Clear cart
    const clearRes = await fetch(`http://localhost:${port}/api/cart`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const clearData = await clearRes.json();
    assert.strictEqual(clearRes.status, 200);
    assert.strictEqual(clearData.success, true);

    // Verify empty
    const emptyRes = await fetch(`http://localhost:${port}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const emptyData = await emptyRes.json();
    assert.strictEqual(emptyData.cartItems.length, 0);
  } finally {
    server.close();
  }
});

// ─── WISHLIST TESTS ──────────────────────────────────────────

test('Wishlist - Unauthenticated access is denied', async (t) => {
  const { server, port } = await createServer();
  try {
    const res = await fetch(`http://localhost:${port}/api/wishlist`);
    assert.strictEqual(res.status, 401);
  } finally {
    server.close();
  }
});

test('Wishlist - Toggle add/remove', async (t) => {
  const { server, port } = await createServer();
  try {
    const token = await getAuthToken(port);
    const productId = await getProductId(port);

    // Add to wishlist
    const addRes = await fetch(`http://localhost:${port}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId })
    });
    const addData = await addRes.json();
    assert.strictEqual(addRes.status, 200);
    assert.strictEqual(addData.action, 'added');

    // Check it's in wishlist
    const checkRes = await fetch(`http://localhost:${port}/api/wishlist/check/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.inWishlist, true);

    // Toggle removes it
    const removeRes = await fetch(`http://localhost:${port}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId })
    });
    const removeData = await removeRes.json();
    assert.strictEqual(removeData.action, 'removed');

    // Verify removed
    const check2Res = await fetch(`http://localhost:${port}/api/wishlist/check/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const check2Data = await check2Res.json();
    assert.strictEqual(check2Data.inWishlist, false);
  } finally {
    server.close();
  }
});

test('Wishlist - Requires productId', async (t) => {
  const { server, port } = await createServer();
  try {
    const token = await getAuthToken(port);
    const res = await fetch(`http://localhost:${port}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({})
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  } finally {
    server.close();
  }
});
