/* Search, region filters and Ask Sunya, run against the real trek files. */
import { treks } from '../data/treks';
import { applyFilters, filtersFromParams, filtersToParams, paramsAreCanonical, EMPTY_FILTERS, queryPlaces } from './catalog';
import { resolvePlace } from './places';
import { askSunya } from './askSunya';
import { regions } from '../data/taxonomy';

jest.mock('../data/treks', () => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '..', 'data', 'treks');
  const { buildCatalog, normalise } = require('../data/treks/build');
  const entries = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
    .map(f => [f, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))]);
  return { ...buildCatalog(entries), normalise };
});

const ids = list => list.map(t => t.id).sort();
const UK = ids(treks.filter(t => t.region === 'uttarakhand'));
const run = query => applyFilters(treks, filtersFromParams(new URLSearchParams(query)));

describe('region filter', () => {
  test('Uttarakhand shows exactly the Uttarakhand treks', () => {
    expect(UK.length).toBeGreaterThan(10);
    expect(ids(run('region=uttarakhand'))).toEqual(UK);
  });

  test.each(['Uttarakhand', 'UTTARAKHAND', ' uttarakhand ', 'Uttrakhand', 'Uttaranchal', 'उत्तराखंड', 'उत्तराखण्ड'])(
    'URL value %p resolves to the same region', v => {
      expect(filtersFromParams(new URLSearchParams({ region: v })).region).toBe('uttarakhand');
    });

  test('every region in the catalog filters to its own treks, by id and by label', () => {
    Object.entries(regions).forEach(([id, r]) => {
      const want = ids(treks.filter(t => t.region === id));
      expect(ids(run(`region=${id}`))).toEqual(want);
      expect(ids(run(new URLSearchParams({ region: r.en }).toString()))).toEqual(want);
    });
  });

  test('a second filter narrows the region results', () => {
    const withSeason = run('region=uttarakhand&season=winter');
    expect(withSeason.length).toBeGreaterThan(0);
    expect(withSeason.length).toBeLessThan(UK.length);
    withSeason.forEach(t => {
      expect(t.region).toBe('uttarakhand');
      expect(t.months.some(m => [12, 1, 2].includes(m))).toBe(true);
    });
    const withDiff = run('region=uttarakhand&difficulty=easy-moderate,moderate&duration=4-7');
    withDiff.forEach(t => {
      expect(t.region).toBe('uttarakhand');
      expect(['easy-moderate', 'moderate']).toContain(t.difficulty);
      expect(t.totalDays).toBeGreaterThanOrEqual(4);
      expect(t.totalDays).toBeLessThanOrEqual(7);
    });
  });

  test('country + region agree; a conflicting country gives way to the region', () => {
    expect(ids(run('country=india&region=uttarakhand'))).toEqual(UK);
    expect(ids(run('country=India&region=Uttarakhand'))).toEqual(UK);
    expect(ids(run('country=nepal&region=uttarakhand'))).toEqual(UK);
  });

  test('clearing filters restores the full catalog', () => {
    expect(applyFilters(treks, { ...EMPTY_FILTERS }).length).toBe(treks.length);
  });

  test('unknown values are dropped, and canonical URLs are recognised', () => {
    const f = filtersFromParams(new URLSearchParams('region=atlantis&difficulty=Moderate,bogus&month=13'));
    expect(f.region).toBe('');
    expect(f.difficulty).toEqual(['moderate']);
    expect(f.month).toBe('');
    const canon = new URLSearchParams(filtersToParams(filtersFromParams(new URLSearchParams('region=uttarakhand&season=winter')), 'recommended'));
    expect(paramsAreCanonical(canon, filtersFromParams(canon), 'recommended')).toBe(true);
    const messy = new URLSearchParams('region=Uttarakhand');
    expect(paramsAreCanonical(messy, filtersFromParams(messy), 'recommended')).toBe(false);
  });
});

describe('search box', () => {
  const q = s => ids(run(new URLSearchParams({ q: s }).toString()));

  test.each(['Uttarakhand', 'uttarakhand', 'Uttrakhand', 'uttara khand', 'Uttaranchal', 'उत्तराखंड', 'उत्तराखण्ड'])(
    '%p finds every Uttarakhand trek', s => expect(q(s)).toEqual(UK));

  test('Garhwal and Kumaon split Uttarakhand without overlap', () => {
    const g = q('garhwal'); const k = q('Kumaon');
    expect(g.length + k.length).toBe(UK.length);
    expect(k).toEqual(['pindari-glacier']);
  });

  test('J&K, HP and other short forms map to one region', () => {
    expect(q('J&K')).toEqual(ids(treks.filter(t => t.region === 'kashmir')));
    expect(q('jammu and kashmir')).toEqual(ids(treks.filter(t => t.region === 'kashmir')));
    expect(q('HP')).toEqual(ids(treks.filter(t => t.region === 'himachal')));
    expect(q('himchal')).toEqual(ids(treks.filter(t => t.region === 'himachal')));
  });

  test('natural phrasing: filler words ignored, season words use open months', () => {
    expect(q('treks in Uttarakhand')).toEqual(UK);
    expect(q('उत्तराखंड में ट्रेक')).toEqual(UK);
    expect(q('uttarakhand winter')).toEqual(ids(run('region=uttarakhand&season=winter')));
  });

  test('place + other words narrow together', () => {
    expect(q('uttarakhand kedarkantha')).toEqual(['kedarkantha']);
    expect(q('nepal annapurna').every(id => treks.find(t => t.id === id).countries.includes('nepal'))).toBe(true);
  });

  test('trek names still work and unrelated places are not "corrected"', () => {
    expect(q('kedarkantha')).toEqual(['kedarkantha']);
    expect(resolvePlace('ireland')).toBeNull();
    expect(queryPlaces('everest base camp')).toEqual([]);
  });
});

describe('Ask Sunya', () => {
  test('region question lists treks from that region and asks a follow-up', () => {
    const r = askSunya('treks in Uttrakhand', { lang: 'en' });
    expect(r.kind).toBe('follow-up');
    expect(r.treks.length).toBeGreaterThan(0);
    r.treks.forEach(id => expect(UK).toContain(id));
    expect(r.links[0].to).toBe('/treks?region=uttarakhand');
  });

  test('season + difficulty + region narrow together', () => {
    const r = askSunya('easy winter treks in uttarakhand', { lang: 'en' });
    r.treks.forEach(id => {
      const t = treks.find(x => x.id === id);
      expect(t.region).toBe('uttarakhand');
      expect(['easy', 'easy-moderate']).toContain(t.difficulty);
      expect(t.months.some(m => [12, 1, 2].includes(m))).toBe(true);
    });
  });

  test('counts are honest when a question narrows a region', () => {
    const all = askSunya('treks in himachal');
    expect(all.text).toMatch(/has 10 treks in Himachal Pradesh\./);
    const easy = askSunya('easy treks in himachal');
    expect(easy.text).toMatch(/in Himachal Pradesh that fit what you asked/);
  });

  test('Hindi region question answers in Hindi', () => {
    const r = askSunya('उत्तराखंड में ट्रेक', { lang: 'en' });
    expect(r.lang).toBe('hi');
    r.treks.forEach(id => expect(UK).toContain(id));
  });

  test('live questions never claim live data', () => {
    const r = askSunya('Is Kedarkantha open today? what is the weather', { lang: 'en' });
    expect(r.live).toEqual({ status: 'unavailable' });
    expect(r.text).toMatch(/not available/i);
    expect(r.text).toMatch(/stable information, not live/);
    expect(r.text).not.toMatch(/real-?time/i);
  });

  test('comparison and itinerary still work', () => {
    expect(askSunya('compare kedarkantha and brahmatal').links[0].to).toBe('/compare?ids=kedarkantha,brahmatal');
    expect(askSunya('kedarkantha itinerary').text).toMatch(/Day 1/);
  });

  test('missing treks, prices and medical questions are declined plainly', () => {
    expect(askSunya('tell me about the Zzyzx ridge trek').text).toMatch(/isn't on the site/);
    expect(askSunya('what is the price of kedarkantha').text).toMatch(/no prices/);
    expect(askSunya('can I take diamox').kind).toBe('safety');
  });
});
