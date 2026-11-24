import { durationBuckets, difficultyIndex, regions, countries, seasons } from '../data/taxonomy';

/* ---------- search ---------- */

export function normaliseText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[–—-]/g, ' ')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function haystack(t) {
  if (!t._hay) {
    const parts = [
      t.id, t.name?.en, t.name?.hi, t.title?.en, t.title?.hi, ...t.aliases,
      t.start?.en, t.start?.hi, t.area?.en, t.highlight?.en, t.highlight?.hi,
      regions[t.region]?.en, regions[t.region]?.hi,
      ...t.countries.flatMap(c => [countries[c]?.en, countries[c]?.hi]),
    ];
    t._hay = normaliseText(parts.filter(Boolean).join(' '));
  }
  return t._hay;
}

export function matchesQuery(t, q) {
  const n = normaliseText(q);
  if (!n) return true;
  const hay = haystack(t);
  return n.split(' ').every(word => hay.includes(word));
}

/* ---------- filters ---------- */

export const EMPTY_FILTERS = {
  q: '', country: '', region: '', duration: '', month: '', season: '',
  difficulty: [], type: [], landscape: [], saved: false,
};

const LIST_KEYS = ['difficulty', 'type', 'landscape'];

export function filtersFromParams(params) {
  const f = { ...EMPTY_FILTERS };
  Object.keys(EMPTY_FILTERS).forEach(k => {
    const v = params.get(k);
    if (v == null) return;
    if (LIST_KEYS.includes(k)) f[k] = v.split(',').filter(Boolean);
    else if (k === 'saved') f.saved = v === '1';
    else f[k] = v;
  });
  return f;
}

export function filtersToParams(f, sort) {
  const p = {};
  Object.keys(EMPTY_FILTERS).forEach(k => {
    const v = f[k];
    if (LIST_KEYS.includes(k)) { if (v.length) p[k] = v.join(','); }
    else if (k === 'saved') { if (v) p.saved = '1'; }
    else if (v) p[k] = v;
  });
  if (sort && sort !== 'recommended') p.sort = sort;
  return p;
}

export function applyFilters(list, f, savedIds = []) {
  const bucket = durationBuckets.find(b => b.id === f.duration);
  const season = seasons.find(s => s.id === f.season);
  const month = f.month ? Number(f.month) : null;
  return list.filter(t => {
    if (f.q && !matchesQuery(t, f.q)) return false;
    if (f.country && !t.countries.includes(f.country)) return false;
    if (f.region && t.region !== f.region) return false;
    if (bucket && (t.totalDays == null || t.totalDays < bucket.min || t.totalDays > bucket.max)) return false;
    if (month && !t.months.includes(month)) return false;
    if (season && !season.months.some(m => t.months.includes(m))) return false;
    if (f.difficulty.length && !f.difficulty.includes(t.difficulty)) return false;
    if (f.type.length && !f.type.every(x => t.types.includes(x))) return false;
    if (f.landscape.length && !f.landscape.some(x => t.landscapes.includes(x))) return false;
    if (f.saved && !savedIds.includes(t.id)) return false;
    return true;
  });
}

export function activeFilterCount(f) {
  return Object.keys(EMPTY_FILTERS).reduce((n, k) => {
    if (k === 'q') return n;
    const v = f[k];
    if (Array.isArray(v)) return n + v.length;
    return n + (v ? 1 : 0);
  }, 0);
}

/* ---------- sorting ---------- */

const EDITORIAL_RANK = { 'editors-pick': 0, classic: 1, quieter: 2, popular: 3 };

export const SORTS = ['recommended', 'shortest', 'longest', 'easiest', 'hardest', 'lowest', 'highest', 'name'];

const nullsLast = (a, b, dir = 1) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return (a - b) * dir;
};

export function sortTreks(list, sort, lang = 'en') {
  const arr = [...list];
  const byName = (a, b) => (a.name[lang] || a.name.en).localeCompare(b.name[lang] || b.name.en, lang);
  switch (sort) {
    case 'shortest': return arr.sort((a, b) => nullsLast(a.totalDays, b.totalDays) || byName(a, b));
    case 'longest': return arr.sort((a, b) => nullsLast(a.totalDays, b.totalDays, -1) || byName(a, b));
    case 'easiest': return arr.sort((a, b) => difficultyIndex(a.difficulty) - difficultyIndex(b.difficulty) || byName(a, b));
    case 'hardest': return arr.sort((a, b) => difficultyIndex(b.difficulty) - difficultyIndex(a.difficulty) || byName(a, b));
    case 'lowest': return arr.sort((a, b) => nullsLast(a.maxAltitudeM, b.maxAltitudeM) || byName(a, b));
    case 'highest': return arr.sort((a, b) => nullsLast(a.maxAltitudeM, b.maxAltitudeM, -1) || byName(a, b));
    case 'name': return arr.sort(byName);
    default:
      // Recommended: treks with a full guide first, then editorial picks, then A–Z.
      return arr.sort((a, b) =>
        Number(b.hasItinerary) - Number(a.hasItinerary) ||
        (EDITORIAL_RANK[a.editorial?.label] ?? 9) - (EDITORIAL_RANK[b.editorial?.label] ?? 9) ||
        byName(a, b));
  }
}

/** Treks similar to `trek` for "related treks". */
export function relatedTreks(all, trek, n = 3) {
  return all
    .filter(t => t.id !== trek.id)
    .map(t => {
      let s = 0;
      if (t.region === trek.region) s += 3;
      else if (t.countries.some(c => trek.countries.includes(c))) s += 1;
      s += t.landscapes.filter(l => trek.landscapes.includes(l)).length;
      s += t.bestMonths.filter(m => trek.bestMonths.includes(m)).length * 0.5;
      s -= Math.abs(difficultyIndex(t.difficulty) - difficultyIndex(trek.difficulty));
      if (t.hasItinerary) s += 0.5;
      return { t, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(x => x.t);
}
