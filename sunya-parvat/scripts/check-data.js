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

  // The same Commons file can be written with "," or "%2C", spaces or underscores.
  const fileKey = u => { try { return decodeURIComponent(String(u || '').split(/File:|\/wiki\//).pop()).replace(/ /g, '_').toLowerCase(); } catch (e) { return String(u); } };

  // Galleries: src/data/treks/galleries/<trek-id>.json
  const fs = require('fs');
  const path = require('path');
  const gdir = path.join(__dirname, '..', 'src', 'data', 'treks', 'galleries');
  const galleries = {};
  if (fs.existsSync(gdir)) {
    fs.readdirSync(gdir).filter(f => f.endsWith('.json')).forEach(f => {
      const id = f.replace(/\.json$/, '');
      try {
        const g = JSON.parse(fs.readFileSync(path.join(gdir, f), 'utf8'));
        if (!Array.isArray(g)) errors.push(`galleries/${f}: must be an array`);
        else galleries[id] = g;
      } catch (e) { errors.push(`galleries/${f}: ${e.message}`); }
    });
  }
  const trekIdsAll = new Set(treks.map(t => t.id));
  Object.keys(galleries).forEach(id => { if (!trekIdsAll.has(id)) errors.push(`galleries/${id}.json: no trek with that id`); });

  // Place names: every alias must resolve to exactly one place.
  const placeNames = new Map();
  const norm = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^\p{L}\p{M}\p{N}]+/gu, '').replace(/and/g, '');
  [['division', tax.divisions], ['region', tax.regions], ['country', tax.countries]].forEach(([kind, map]) => {
    Object.entries(map).forEach(([id, p]) => [id, p.en, p.hi, ...(p.aliases || [])].filter(Boolean).forEach(name => {
      const k = norm(name);
      const prev = placeNames.get(k);
      if (prev && prev !== `${kind}:${id}`) errors.push(`place name "${name}" is used by both ${prev} and ${kind}:${id}`);
      placeNames.set(k, `${kind}:${id}`);
    }));
  });

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
    if (t.division != null) {
      if (!tax.divisions[t.division]) err(`unknown division "${t.division}"`);
      else if (tax.divisions[t.division].region !== t.region) err(`division "${t.division}" is not in region "${t.region}"`);
    }
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
    if (it.length && t.totalDays != null && it.length !== t.totalDays) err(`itinerary has ${it.length} days but totalDays is ${t.totalDays}`);
    // Walking days on the facts card must match the day-by-day plan
    // (trekking, summit/pass and acclimatisation-hike days count as walking).
    const walking = it.filter(d => !d.kind || ['trek', 'summit', 'acclimatisation'].includes(d.kind)).length;
    if (it.length && t.walkingDays != null && walking !== t.walkingDays) err(`walkingDays is ${t.walkingDays} but the itinerary has ${walking} walking days`);
    const itMax = Math.max(0, ...it.map(d => d.altitudeM || 0));
    if (itMax && t.maxAltitudeM != null && itMax !== t.maxAltitudeM) warn(`highest itinerary day is ${itMax} m but maxAltitudeM is ${t.maxAltitudeM}`);

    const gallery = galleries[t.id] || [];
    gallery.forEach((g, i) => {
      const gat = `gallery photo ${i + 1}`;
      ['src', 'sourceUrl', 'license', 'author'].forEach(k => { if (!g[k]) err(`${gat}: ${k} missing`); });
      if (!g.alt || !g.alt.en) err(`${gat}: alt.en missing`);
      if (!['route', 'regional'].includes(g.scope)) err(`${gat}: scope must be "route" or "regional"`);
      if (/\bNC\b|\bND\b|non-?commercial|no ?deriv|^GFDL/i.test(g.license || '')) err(`${gat}: license "${g.license}" is not suitable`);
      if (t.image && fileKey(g.sourceUrl) === fileKey(t.image.sourceUrl)) err(`${gat}: repeats the hero photo`);
    });
    const seenSrc = new Set();
    gallery.forEach(g => { const k = fileKey(g.sourceUrl); if (seenSrc.has(k)) err(`gallery repeats ${g.sourceUrl}`); seenSrc.add(k); });

    const img = t.image;
    if (!img) warn('no photo yet (placeholder shown)');
    else {
      ['src', 'sourceUrl', 'license', 'author'].forEach(k => { if (!img[k]) err(`image.${k} missing`); });
      if (!img.alt || !img.alt.en) err('image.alt.en missing');
      if (!img.alt || !img.alt.hi) warn('image.alt.hi missing');
      if (!['route', 'regional'].includes(img.scope)) err('image.scope must be "route" or "regional"');
      if (/\bNC\b|\bND\b|non-?commercial|no ?deriv|^GFDL/i.test(img.license || '')) err(`image license "${img.license}" is not suitable (NC/ND, or GFDL-only which needs the full license text)`);
      if (img.licenseUrl == null && !/public domain|cc0|pd/i.test(img.license || '')) warn('image.licenseUrl missing');
    }

    (t.journal || []).forEach(a => { if (!articleIds.has(a)) err(`unknown journal article "${a}"`); });

    ['totalDays', 'maxAltitudeM', 'start'].forEach(k => { if (t[k] == null) warn(`${k} unknown (shown as "Not verified")`); });
    const v = t.verification || {};
    if (v.status === 'verified' && !v.checkedOn) err('verified without checkedOn date');
    if (v.status !== 'verified') warn('facts not yet verified');
  });

  const unverified = warnings.filter(w => w.endsWith('facts not yet verified')).length;
  const noPhoto = warnings.filter(w => w.endsWith('placeholder shown)')).length;
  const regional = treks.filter(t => t.image && t.image.scope === 'regional').length;
  console.log(`Checked ${treks.length} treks: ${errors.length} errors, ${warnings.length - unverified - noPhoto} warnings, ${unverified} unverified.`);
  console.log(`Photos: ${treks.length - noPhoto} with photo (${regional} regional), ${noPhoto} placeholder.`);
  const gCounts = treks.map(t => (galleries[t.id] || []).length + (t.image ? 1 : 0));
  console.log(`Galleries: ${Object.keys(galleries).length} treks have a gallery; ${gCounts.filter(n => n >= 5).length} treks have 5+ photos, ${gCounts.filter(n => n > 0 && n < 5).length} have 1–4, ${gCounts.filter(n => n === 0).length} have none.`);
  if (process.argv.includes('--verbose')) warnings.forEach(w => console.log('  warn ' + w));
  errors.forEach(e => console.error('  ERROR ' + e));
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
