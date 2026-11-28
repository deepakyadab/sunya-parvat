/*
  Tests for the enquiry handler — no email is sent (mock providers only).
    npm run test:enquiry
*/
const assert = require('assert');
const { handleEnquiry, _resetRateLimit } = require('../api/_lib/enquiry');

const base = {
  name: 'Asha Rawat', email: 'asha@example.com', message: 'Is Kedarkantha suitable in late December for a first trek?',
  trek: 'kedarkantha', trekName: 'Kedarkantha', lang: 'en', website: '', startedAt: Date.now() - 20000,
};
const mockEnv = { EMAIL_PROVIDER: 'mock', ENQUIRY_TO: 'sunyaparvat@gmail.com', NODE_ENV: 'test' };

const cases = [];
const test = (name, fn) => cases.push([name, fn]);
const call = (body, env = mockEnv, extra = {}) => handleEnquiry({ method: 'POST', body, ip: `ip-${Math.random()}`, origin: 'http://localhost:3000', env, ...extra });

test('valid enquiry is accepted by the provider', async () => {
  const sent = [];
  const orig = console.log; console.log = m => sent.push(String(m));
  const r = await call(base);
  console.log = orig;
  assert.strictEqual(r.status, 200); assert.strictEqual(r.body.ok, true);
  const mail = sent.join('\n');
  assert.ok(mail.includes('to=sunyaparvat@gmail.com'), 'goes to ENQUIRY_TO');
  assert.ok(mail.includes('reply_to=asha@example.com'), 'reply-to is the visitor');
  ['Asha Rawat', 'Kedarkantha', 'late December'].forEach(s => assert.ok(mail.includes(s), `contains ${s}`));
});
test('missing and invalid fields are rejected with field codes', async () => {
  const r = await call({ ...base, name: '', email: 'not-an-email', message: 'hi' });
  assert.strictEqual(r.status, 400);
  assert.deepStrictEqual(r.body.fields, { name: 'required', email: 'invalid', message: 'too_short' });
});
test('overlong message is rejected', async () => {
  const r = await call({ ...base, message: 'x'.repeat(2100) });
  assert.strictEqual(r.body.fields.message, 'too_long');
});
test('bad trek id is rejected', async () => {
  const r = await call({ ...base, trek: '../etc' });
  assert.strictEqual(r.body.fields.trek, 'invalid');
});
test('honeypot is silently accepted but not sent', async () => {
  let sent = false; const orig = console.log; console.log = () => { sent = true; };
  const r = await call({ ...base, website: 'http://spam' });
  console.log = orig;
  assert.strictEqual(r.status, 200); assert.strictEqual(sent, false);
});
test('too-fast submissions are treated as spam', async () => {
  let sent = false; const orig = console.log; console.log = () => { sent = true; };
  await call({ ...base, startedAt: Date.now() });
  console.log = orig;
  assert.strictEqual(sent, false);
});
test('provider failure returns delivery_failed without details', async () => {
  const orig = console.error; console.error = () => {};
  const r = await call(base, { ...mockEnv, EMAIL_PROVIDER: 'mock-fail' });
  console.error = orig;
  assert.strictEqual(r.status, 502);
  assert.deepStrictEqual(r.body, { ok: false, error: 'delivery_failed' });
});
test('missing configuration returns unavailable', async () => {
  const orig = console.error; console.error = () => {};
  const r = await call(base, { NODE_ENV: 'test' });
  console.error = orig;
  assert.deepStrictEqual(r.body, { ok: false, error: 'unavailable' });
});
test('mock provider is refused in production', async () => {
  const orig = console.error; console.error = () => {};
  const r = await call(base, { ...mockEnv, NODE_ENV: 'production' });
  console.error = orig;
  assert.strictEqual(r.status, 503);
});
test('foreign origin is refused', async () => {
  const r = await call(base, mockEnv, { origin: 'https://evil.example' });
  assert.strictEqual(r.status, 403);
});
test('rate limit after 5 requests from one IP', async () => {
  _resetRateLimit();
  const orig = console.log; console.log = () => {};
  const statuses = [];
  for (let i = 0; i < 7; i++) statuses.push((await call(base, mockEnv, { ip: 'same-ip' })).status);
  console.log = orig;
  assert.deepStrictEqual(statuses, [200, 200, 200, 200, 200, 429, 429]);
});
test('overall cap stops a flood from many different IPs', async () => {
  _resetRateLimit();
  const orig = console.log; console.log = () => {};
  const statuses = [];
  for (let i = 0; i < 32; i++) statuses.push((await call(base)).status);
  console.log = orig;
  _resetRateLimit();
  assert.strictEqual(statuses.filter(s => s === 200).length, 30);
  assert.deepStrictEqual(statuses.slice(30), [429, 429]);
});
test('header injection in name cannot add lines to the subject', async () => {
  const out = []; const orig = console.log; console.log = m => out.push(String(m));
  await call({ ...base, name: 'Eve\r\nBcc: x@y.z' });
  console.log = orig;
  const subject = out.join('').match(/subject="([^"]*)"/)[1];
  assert.ok(!/[\r\n]/.test(subject));
});
test('GET is not allowed', async () => {
  const r = await handleEnquiry({ method: 'GET', env: mockEnv });
  assert.strictEqual(r.status, 405);
});

(async () => {
  let failed = 0;
  for (const [name, fn] of cases) {
    try { await fn(); console.log(`  ✓ ${name}`); } catch (e) { failed++; console.log(`  ✗ ${name}\n    ${e.message}`); }
  }
  console.log(`${cases.length - failed}/${cases.length} passed`);
  process.exit(failed ? 1 : 0);
})();
