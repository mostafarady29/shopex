const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server');

test('Health Check API', async (t) => {
  const server = http.createServer(app);
  
  // Start server on a random port
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  
  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    const data = await res.json();
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  } finally {
    server.close();
  }
});
