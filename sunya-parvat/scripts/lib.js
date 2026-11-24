/* Shared helpers for the Node scripts (prerender, check-data, editor-server). */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const TREK_DIR = path.join(ROOT, 'src', 'data', 'treks');

function readTrekFiles() {
  return fs.readdirSync(TREK_DIR)
    .filter(f => f.endsWith('.json'))
    .map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(TREK_DIR, file), 'utf8'));
      return { file, data, items: Array.isArray(data) ? data : [data] };
    });
}

function loadTreks() {
  return readTrekFiles().flatMap(({ file, items }) => items.map(t => ({ ...t, _file: file })));
}

/* The site's data modules are ES modules; load them in any Node version. */
async function importEsm(relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const tmp = path.join(os.tmpdir(), `sp-${path.basename(relPath, '.js')}-${process.pid}.mjs`);
  fs.writeFileSync(tmp, src);
  try { return await import(pathToFileURL(tmp).href); } finally { fs.unlinkSync(tmp); }
}

module.exports = { ROOT, TREK_DIR, readTrekFiles, loadTreks, importEsm };
