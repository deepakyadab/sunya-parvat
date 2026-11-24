/*
  One place vocabulary for the whole site.

  The directory filters, the search box, shared URLs, trek pages and Ask Sunya all
  resolve place names through this file, so "Uttarakhand", "uttarakhand", "Uttrakhand",
  "Uttaranchal" and "उत्तराखण्ड" all end up as the same region id ("uttarakhand"),
  the id stored on every trek record. Nothing here holds results: it only maps words
  to the ids in src/data/taxonomy.js.
*/
import { regions, countries, divisions } from '../data/taxonomy';

export function normaliseText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[–—-]/g, ' ')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const compact = s => normaliseText(s).replace(/ and /g, ' ').replace(/\s+/g, '');
const isLatin = s => /^[a-z0-9]+$/.test(s);

/* ---------- lexicon ---------- */

const TERMS = new Map(); // compact term -> { kind, id }
function addTerm(term, kind, id) {
  const key = compact(term);
  if (!key) return;
  const prev = TERMS.get(key);
  // A term must point to one place only; the first (most specific) wins.
  if (!prev) TERMS.set(key, { kind, id });
}

// Divisions first (most specific), then regions, then countries.
Object.entries(divisions).forEach(([id, d]) => [id, d.en, d.hi, ...(d.aliases || [])].forEach(x => addTerm(x, 'division', id)));
Object.entries(regions).forEach(([id, r]) => [id, r.en, r.hi, ...(r.aliases || [])].forEach(x => addTerm(x, 'region', id)));
Object.entries(countries).forEach(([id, c]) => [id, c.en, c.hi, ...(c.aliases || [])].forEach(x => addTerm(x, 'country', id)));

// Real places that are one letter away from a catalog place; never "correct" them.
const NOT_A_SLIP = new Set(['ireland']);

const FUZZY = [...TERMS.entries()].filter(([k]) => isLatin(k) && k.length >= 6);

/** Damerau–Levenshtein distance, capped (returns cap+1 once exceeded). */
function distance(a, b, cap) {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > cap) return cap + 1;
  }
  return d[a.length][b.length];
}

/** Resolve one phrase to a place, allowing a small spelling slip in longer Latin words. */
export function resolvePlace(phrase, { fuzzy = true } = {}) {
  const key = compact(phrase);
  if (!key) return null;
  if (TERMS.has(key)) return TERMS.get(key);
  if (!fuzzy || !isLatin(key) || key.length < 6 || NOT_A_SLIP.has(key)) return null;
  const cap = key.length >= 10 ? 2 : 1;
  let best = null;
  for (const [term, place] of FUZZY) {
    const dd = distance(key, term, cap);
    if (dd <= cap && (!best || dd < best.d)) best = { d: dd, place };
  }
  return best ? best.place : null;
}

/** A region id from a URL value, a label or an alias; null if it isn't a known region. */
export function resolveRegionId(value) {
  if (!value) return null;
  if (regions[value]) return value;
  const p = resolvePlace(value);
  return p && p.kind === 'region' ? p.id : null;
}

export function resolveCountryId(value) {
  if (!value) return null;
  if (countries[value]) return value;
  const p = resolvePlace(value);
  return p && p.kind === 'country' ? p.id : null;
}

/**
 * Split a free-text query into recognised places and remaining words.
 * Longest phrases are tried first, so "jammu and kashmir" is one place, not three words.
 */
export function parseQuery(q) {
  const tokens = normaliseText(q).split(' ').filter(Boolean);
  const places = [];
  const words = [];
  let i = 0;
  while (i < tokens.length) {
    let hit = null;
    for (let len = Math.min(4, tokens.length - i); len >= 1; len--) {
      const phrase = tokens.slice(i, i + len).join(' ');
      // Fuzzy matching only on single words or two-word names, never across a long phrase.
      const p = resolvePlace(phrase, { fuzzy: len <= 2 });
      if (p) { hit = { place: p, len }; break; }
    }
    if (hit) {
      if (!places.some(x => x.kind === hit.place.kind && x.id === hit.place.id)) places.push(hit.place);
      i += hit.len;
    } else {
      const w = tokens[i];
      // Lone Latin letters ("j", "k") match almost anything; skip them.
      if (!(w.length === 1 && isLatin(w)) && w !== 'and') words.push(w);
      i += 1;
    }
  }
  return { places, words };
}

/** Does a trek sit in all the place kinds named (any of several of the same kind)? */
export function matchesPlaces(trek, places) {
  const byKind = { region: [], country: [], division: [] };
  places.forEach(p => byKind[p.kind].push(p.id));
  if (byKind.region.length && !byKind.region.includes(trek.region)) return false;
  if (byKind.country.length && !byKind.country.some(c => trek.countries.includes(c))) return false;
  if (byKind.division.length && !byKind.division.includes(trek.division)) return false;
  return true;
}
