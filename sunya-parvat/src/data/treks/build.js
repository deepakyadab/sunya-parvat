/*
  Builds the catalog from raw trek records. Kept separate from index.js (which
  uses webpack's require.context) so tests and scripts can load the same files.
*/
import { seasons } from '../taxonomy';

const DEFAULT_VERIFICATION = { status: 'unverified', checkedOn: null, sources: [] };

export function normalise(raw, file) {
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
  t.gallery = t.gallery || [];
  t.verification = { ...DEFAULT_VERIFICATION, ...(t.verification || {}) };
  // Seasons are always derived from months so cards, filters and pages agree.
  t.seasons = seasons.filter(s => s.months.some(m => t.months.includes(m))).map(s => s.id);
  t.bestSeasons = seasons.filter(s => s.months.some(m => t.bestMonths.includes(m))).map(s => s.id);
  t.hasItinerary = t.itinerary.length > 0;
  return t;
}

/** entries: [[fileName, jsonData], ...] where jsonData is one trek or an array. */
export function buildCatalog(entries) {
  const loaded = [];
  entries.forEach(([file, data]) => {
    (Array.isArray(data) ? data : [data]).forEach(item => loaded.push(normalise(item, file)));
  });

  // Guard against duplicate ids across files (last one would silently win otherwise).
  const seen = new Set();
  const allTreks = loaded.filter(t => {
    if (seen.has(t.id)) {
      if (process.env.NODE_ENV !== 'production') console.warn(`Duplicate trek id "${t.id}" in ${t._file}`);
      return false;
    }
    seen.add(t.id);
    return true;
  });

  /** Published treks: the only ones visitors, the guide and Ask Sunya can see. */
  const treks = allTreks
    .filter(t => t.status === 'published')
    .sort((a, b) => a.name.en.localeCompare(b.name.en));

  const byId = new Map();
  treks.forEach(t => {
    byId.set(t.id, t);
    t.legacyIds.forEach(l => byId.set(l, t));
  });

  return {
    allTreks,
    treks,
    getTrek: id => byId.get(id) || null,
    isLegacyId: id => byId.has(id) && byId.get(id).id !== id,
  };
}
