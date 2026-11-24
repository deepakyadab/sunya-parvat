import { months as MONTHS, countries, regions, difficulties, seasons } from '../data/taxonomy';
import { pick } from '../i18n';

const nf = new Intl.NumberFormat('en-IN');

export function altitude(m, lang) {
  if (m == null) return null;
  return lang === 'hi' ? `${nf.format(m)} मी.` : `${nf.format(m)} m`;
}

export function km(v, lang) {
  if (v == null) return null;
  return lang === 'hi' ? `लगभग ${v} किमी` : `~${v} km`;
}

export function days(n, lang) {
  if (n == null) return null;
  if (lang === 'hi') return `${n} दिन`;
  return `${n} ${n === 1 ? 'day' : 'days'}`;
}

export function hours(h, lang) {
  if (!h) return null;
  const v = String(h).replace('(drive)', lang === 'hi' ? '(ड्राइव)' : '(drive)');
  return lang === 'hi' ? `${v} घंटे` : `${v} h`;
}

function monthLabel(n, lang, long = false) {
  const m = MONTHS[n - 1];
  if (lang === 'hi') return m.hi;
  return long ? m.en : m.short;
}

/**
 * Turn [12,1,2,4] into "Dec–Feb, Apr". Handles year wrap-around so
 * winter ranges read naturally.
 */
export function monthRange(list, lang, long = false) {
  if (!list || !list.length) return null;
  const set = new Set(list);
  if (set.size === 12) return lang === 'hi' ? 'साल भर' : 'Year-round';
  // find a start month whose previous month is not in the set
  let start = 1;
  for (let m = 1; m <= 12; m++) {
    const prev = m === 1 ? 12 : m - 1;
    if (set.has(m) && !set.has(prev)) { start = m; break; }
  }
  const runs = [];
  let run = null;
  for (let i = 0; i < 12; i++) {
    const m = ((start - 1 + i) % 12) + 1;
    if (set.has(m)) {
      if (!run) run = [m, m]; else run[1] = m;
    } else if (run) { runs.push(run); run = null; }
  }
  if (run) runs.push(run);
  return runs
    .map(([a, b]) => (a === b ? monthLabel(a, lang, long) : `${monthLabel(a, lang, long)}–${monthLabel(b, lang, long)}`))
    .join(', ');
}

export const countryName = (id, lang) => pick(countries[id], lang) || id;
export const regionName = (id, lang) => pick(regions[id], lang) || id;
export const difficultyName = (id, lang) => pick(difficulties.find(d => d.id === id), lang) || id;
export const seasonName = (id, lang) => pick(seasons.find(s => s.id === id), lang) || id;

export function location(trek, lang) {
  const c = trek.countries.map(c => countryName(c, lang)).join(' · ');
  const r = regionName(trek.region, lang);
  return trek.countries[0] === 'india' || trek.countries[0] === 'nepal' ? `${r}, ${c}` : c;
}

export function formatDate(iso, lang) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return iso; }
}
