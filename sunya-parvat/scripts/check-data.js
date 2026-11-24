/*
  Validates the trek catalog. Run before committing a new batch:
    npm run check-data
  Fails on errors (broken data); prints warnings for honesty gaps
  (missing Hindi, unverified facts, unknown values) so they can be tracked.
*/
const { loadTreks, importEsm } = require('./lib');

(async () => {
  const tax = await importEsm('src/data/taxonomy.js');
  const { articles } = await importEsm('src/data/journal.js');
  const treks = loadTreks();
  const errors = [];
  const warnings = [];
  const ids = new Map();
  const diffIds = tax.difficulties.map(d => d.id);
  const articleIds = new Set(articles.map(a => a.id));

  treks.forEach(t => {
    const at = `${t.id || '(no id)'} [${t._file}]`;
    const err = m => errors.push(`${at}: ${m}`);
    const warn = m => warnings.push(`${at}: ${m}`);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id || '')) err('invalid id');
    if (ids.has(t.id)) err(`duplicate id (also in ${ids.get(t.id)})`);
    ids.set(t.id, t._file);
    (t.legacyIds || []).forEach(l => { if (ids.has(l)) err(`legacy id ${l} clashes`); });

    if (!t.name || !t.name.en) err('missing name.en');
    if (!t.name || !t.name.hi) warn('missing Hindi name');
    if (!t.highlight || !t.highlight.en) err('missing highlight.en');
    if (!tax.regions[t.region]) err(`unknown region "${t.region}"`);
    (t.countries || []).forEach(c => { if (!tax.countries[c]) err(`unknown country "${c}"`); });
    if (!diffIds.includes(t.difficulty)) err(`unknown difficulty "${t.difficulty}"`);
    (t.types || []).forEach(x => { if (!tax.experienceTypes[x]) err(`unknown type "${x}"`); });
    (t.landscapes || []).forEach(x => { if (!tax.landscapes[x]) err(`unknown landscape "${x}"`); });
    if (t.guide && !tax.guideRules[t.guide]) err(`unknown guide rule "${t.guide}"`);
    if (t.editorial && !tax.editorialLabels[t.editorial.label]) err(`unknown editorial label "${t.editorial && t.editorial.label}"`);

    const months = t.months || [];
    if (!months.length) err('no months');
    if (months.some(m => m < 1 || m > 12)) err('month out of range');
    (t.bestMonths || []).forEach(m => { if (!months.includes(m)) err(`best month ${m} is not in months`); });

    if (t.walkingDays != null && t.totalDays != null && t.walkingDays > t.totalDays) err('walkingDays > totalDays');
    if (t.maxAltitudeM != null && (t.maxAltitudeM < 0 || t.maxAltitudeM > 8848)) err('implausible altitude');

    const it = t.itinerary || [];
    it.forEach((d, i) => {
      if (d.day !== i + 1) err(`itinerary day ${d.day} out of order (expected ${i + 1})`);
      if (!d.route || !d.route.en) err(`day ${d.day} missing route.en`);
      if (d.kind && !tax.dayKinds[d.kind]) err(`day ${d.day} unknown kind "${d.kind}"`);
      if (d.altitudeM != null && t.maxAltitudeM != null && d.altitudeM > t.maxAltitudeM) err(`day ${d.day} altitude above trek maximum`);
    });
    if (it.length && t.totalDays != null && it.length !== t.totalDays) warn(`itinerary has ${it.length} days but totalDays is ${t.totalDays}`);

    (t.journal || []).forEach(a => { if (!articleIds.has(a)) err(`unknown journal article "${a}"`); });

    ['totalDays', 'maxAltitudeM', 'start'].forEach(k => { if (t[k] == null) warn(`${k} unknown (shown as "Not verified")`); });
    const v = t.verification || {};
    if (v.status === 'verified' && !v.checkedOn) err('verified without checkedOn date');
    if (v.status !== 'verified') warn('facts not yet verified');
  });

  const unverified = warnings.filter(w => w.endsWith('facts not yet verified')).length;
  console.log(`Checked ${treks.length} treks: ${errors.length} errors, ${warnings.length - unverified} warnings, ${unverified} unverified.`);
  if (process.argv.includes('--verbose')) warnings.forEach(w => console.log('  warn ' + w));
  errors.forEach(e => console.error('  ERROR ' + e));
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
