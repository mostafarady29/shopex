const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

test('Auth Register API - Missing Data', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  
  try {
    const res = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    
    // This should be 400 for missing data
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  } finally {
    server.close();
  }
});

test('Auth Register API - Success', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  
  try {
    const res = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, 'test@example.com');
  } finally {
    server.close();
  }
});
