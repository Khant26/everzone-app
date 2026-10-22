// HTTP-level smoke tests that need no database: they exercise the Express app
// (middleware, route registration, auth guards) without calling initDb.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET ||= 'test-secret-for-node-test-only-0123456789';
process.env.CORS_ORIGIN ||= 'http://localhost:5173';

const { default: app } = await import('../src/app.js');
const { default: pool } = await import('../src/config/database.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('GET /health returns 200 JSON', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /application\/json/);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.status, 'ok');
});

test('GET /api/health is an alias of /health', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
});

test('unknown routes return a JSON 404', async () => {
  const res = await fetch(`${baseUrl}/api/does-not-exist`);
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.success, false);
});

test('admin routes reject requests without a token', async () => {
  const res = await fetch(`${baseUrl}/api/admin/contact-forms`);
  assert.equal(res.status, 401);
});

test('admin routes reject an invalid token', async () => {
  const res = await fetch(`${baseUrl}/api/admin/contact-forms`, {
    headers: { Authorization: 'Bearer not-a-real-token' },
  });
  assert.ok([401, 403].includes(res.status), `unexpected ${res.status}`);
});

test('CORS allows the configured origin', async () => {
  const res = await fetch(`${baseUrl}/health`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('expected API routers are registered', () => {
  const router = app._router ?? app.router;
  const mounts = router.stack
    .filter((layer) => layer.name === 'router')
    .map((layer) => String(layer.regexp));
  for (const prefix of ['services', 'categories', 'projects', 'contact-forms', 'admin']) {
    assert.ok(
      mounts.some((source) => source.includes(prefix)),
      `router for /api/${prefix} is not mounted`
    );
  }
});
