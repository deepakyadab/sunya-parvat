/*
  Trek catalog loader.

  Every *.json file in this folder is loaded automatically. A file may hold
  one trek object or an array of treks, so you can add a single new route as
  `my-trek.json` or extend a regional file — no UI code needs to change.

  Field guide (see README "Trek data" for the full list):
  - Facts (totalDays, maxAltitudeM, months, permits …) are what the route IS.
    Use null when a value is unknown; the site shows "Not verified" instead of guessing.
  - Editorial fields (editorial.label, tagline, reflection) are Sunya Parvat's opinion.
  - verification.status / checkedOn / sources record when safety-sensitive facts
    were last confirmed. Everything starts as "unverified".
*/
import { seasons } from '../taxonomy';

const ctx = require.context('./', false, /\.json$/);

const DEFAULT_VERIFICATION = { status: 'unverified', checkedOn: null, sources: [] };

function normalise(raw, file) {
  const t = { ...raw, _file: file };
  t.status = t.status || 'published';
  t.countries = t.countries || [];
  t.types = t.types || [];
  t.landscapes = t.landscapes || [];
  t.months = (t.months || []).map(Number);
  t.bestMonths = (t.bestMonths || t.months).map(Number);
  t.aliases = t.aliases || [];
  t.legacyIds = t.legacyIds || [];
  t.itinerary = t.itinerary || [];
  t.highlights = t.highlights || [];
  t.faqs = t.faqs || [];
  t.journal = t.journal || [];
  t.verification = { ...DEFAULT_VERIFICATION, ...(t.verification || {}) };
  // Seasons are always derived from months so cards, filters and pages agree.
  t.seasons = seasons.filter(s => s.months.some(m => t.months.includes(m))).map(s => s.id);
  t.bestSeasons = seasons.filter(s => s.months.some(m => t.bestMonths.includes(m))).map(s => s.id);
  t.hasItinerary = t.itinerary.length > 0;
  return t;
}

const loaded = [];
ctx.keys().forEach(key => {
  const data = ctx(key);
  const file = key.replace('./', '');
  (Array.isArray(data) ? data : [data]).forEach(item => loaded.push(normalise(item, file)));
});

// Guard against duplicate ids across files (last one would silently win otherwise).
const seen = new Set();
export const allTreks = loaded.filter(t => {
  if (seen.has(t.id)) {
    if (process.env.NODE_ENV !== 'production') console.warn(`Duplicate trek id "${t.id}" in ${t._file}`);
    return false;
  }
  seen.add(t.id);
  return true;
});

/** Published treks: the only ones visitors, the guide and Ask Sunya can see. */
export const treks = allTreks
  .filter(t => t.status === 'published')
  .sort((a, b) => a.name.en.localeCompare(b.name.en));

const byId = new Map();
treks.forEach(t => {
  byId.set(t.id, t);
  t.legacyIds.forEach(l => byId.set(l, t));
});

export const getTrek = id => byId.get(id) || null;
export const isLegacyId = id => byId.has(id) && byId.get(id).id !== id;

export { normalise };
