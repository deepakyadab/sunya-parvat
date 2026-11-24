/*
  Local editor server — writes trek JSON files for the /editor page.

    npm run editor-server      (in one terminal)
    npm start                  (in another), then open http://localhost:3000/editor

  Security model: it listens on 127.0.0.1 only and accepts requests only
  from the local dev site, so it is reachable from the owner's own machine
  and nowhere else. It never runs on Vercel. Changes land as ordinary file
  edits that the owner reviews and commits with git.
*/
const fs = require('fs');
const http = require('http');
const path = require('path');
const { TREK_DIR, readTrekFiles } = require('./lib');

const PORT = Number(process.env.EDITOR_PORT || 4321);
const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function send(res, status, body, origin) {
  const headers = { 'Content-Type': 'application/json' };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function saveTrek(trek) {
  const files = readTrekFiles();
  for (const f of files) {
    const idx = f.items.findIndex(t => t.id === trek.id);
    if (idx === -1) continue;
    const next = Array.isArray(f.data) ? f.items.map((t, i) => (i === idx ? trek : t)) : trek;
    fs.writeFileSync(path.join(TREK_DIR, f.file), JSON.stringify(next, null, 2) + '\n');
    return f.file;
  }
  const file = `${trek.id}.json`;
  fs.writeFileSync(path.join(TREK_DIR, file), JSON.stringify(trek, null, 2) + '\n');
  return file;
}

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '';
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return send(res, 403, { error: 'Origin not allowed' }, origin);
  if (req.method === 'OPTIONS') return send(res, 204, {}, origin);
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true }, origin);

  const m = req.url.match(/^\/treks\/([^/?]+)$/);
  if (req.method === 'POST' && m) {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1e6) { req.destroy(); }
    });
    req.on('end', () => {
      try {
        const trek = JSON.parse(raw);
        if (!ID_RE.test(trek.id || '') || trek.id !== decodeURIComponent(m[1])) throw new Error('Invalid or mismatched id');
        if (!trek.name || !trek.name.en) throw new Error('name.en is required');
        if (!['draft', 'published'].includes(trek.status)) throw new Error('status must be draft or published');
        const file = saveTrek(trek);
        console.log(`Saved ${trek.id} (${trek.status}) → src/data/treks/${file}`);
        send(res, 200, { ok: true, file }, origin);
      } catch (e) {
        send(res, 400, { error: e.message }, origin);
      }
    });
    return undefined;
  }
  return send(res, 404, { error: 'Not found' }, origin);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Sunya Parvat editor server on http://127.0.0.1:${PORT} (local only)`);
  console.log('Open http://localhost:3000/editor while `npm start` is running.');
});
