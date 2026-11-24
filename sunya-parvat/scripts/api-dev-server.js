/*
  Runs /api/enquiry locally for development (Vercel runs api/enquiry.js in production).
    npm run api        → http://127.0.0.1:4322  (npm start proxies /api to it)
  Reads .env.local if present. With no Resend key, set EMAIL_PROVIDER=mock to log
  emails to this terminal instead of sending them.
*/
const fs = require('fs');
const http = require('http');
const path = require('path');

const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const { handleEnquiry } = require('../api/_lib/enquiry');
const PORT = Number(process.env.API_PORT || 4322);

http.createServer((req, res) => {
  if (req.url !== '/api/enquiry') { res.writeHead(404); return res.end(); }
  let raw = '';
  req.on('data', c => { raw += c; if (raw.length > 20000) req.destroy(); });
  req.on('end', async () => {
    let body = null;
    try { body = JSON.parse(raw); } catch (e) { /* invalid */ }
    // CRA's dev proxy rewrites Origin to this server's own address; map it back to the dev site.
    let origin = req.headers.origin;
    if (origin === `http://127.0.0.1:${PORT}` || origin === `http://localhost:${PORT}`) origin = 'http://localhost:3000';
    const r = await handleEnquiry({ method: req.method, body, ip: req.socket.remoteAddress, origin });
    res.writeHead(r.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(r.body));
  });
  return undefined;
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Enquiry API on http://127.0.0.1:${PORT}/api/enquiry (provider: ${process.env.EMAIL_PROVIDER || 'resend'}, to: ${process.env.ENQUIRY_TO || '(ENQUIRY_TO not set)'})`);
});
