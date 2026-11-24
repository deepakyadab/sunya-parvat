/*
  "Find my trek" scoring. Plain rules, no hidden weighting:
  a trek must be open in the chosen month and roughly fit the time available,
  then it earns points for matching experience and landscape.
  Each point comes with a sentence so the visitor can see why it was chosen.
*/
import { difficultyIndex, landscapes as LANDSCAPES, months as MONTHS } from '../data/taxonomy';
import { pick } from '../i18n';

export const DAY_OPTIONS = [
  { id: 'weekend', min: 1, max: 3, en: '1–3 days (a weekend)', hi: '1–3 दिन (एक वीकेंड)' },
  { id: 'short', min: 4, max: 6, en: '4–6 days', hi: '4–6 दिन' },
  { id: 'week', min: 7, max: 10, en: '7–10 days', hi: '7–10 दिन' },
  { id: 'long', min: 11, max: 99, en: '11 days or more', hi: '11 दिन या अधिक' },
];

export const EXPERIENCE_OPTIONS = [
  { id: 'first', en: 'This will be my first trek', hi: 'यह मेरा पहला ट्रेक होगा' },
  { id: 'some', en: "I've done one or two treks", hi: 'मैंने एक-दो ट्रेक किए हैं' },
  { id: 'experienced', en: "I've done high-altitude treks", hi: 'मैंने ऊँचाई वाले ट्रेक किए हैं' },
];

const R = {
  bestMonth: { en: m => `${m} is one of its best months.`, hi: m => `${m} इसके सबसे अच्छे महीनों में से एक है।` },
  openMonth: { en: m => `It is trekked in ${m}, though not at its peak season.`, hi: m => `${m} में यह किया जाता है, हालाँकि यह इसका मुख्य मौसम नहीं है।` },
  daysFit: { en: d => `${d} fits the time you have.`, hi: d => `${d} आपके समय में फ़िट बैठता है।` },
  daysNear: { en: d => `${d} is a little outside your range but close.`, hi: d => `${d} आपकी सीमा से थोड़ा बाहर है, पर क़रीब है।` },
  firstOk: { en: () => 'Its difficulty is suitable for a first trek.', hi: () => 'इसकी कठिनाई पहले ट्रेक के लिए उपयुक्त है।' },
  someOk: { en: () => 'A sensible next step after one or two treks.', hi: () => 'एक-दो ट्रेक के बाद एक समझदार अगला क़दम।' },
  expOk: { en: () => 'It offers the challenge an experienced trekker looks for.', hi: () => 'यह वह चुनौती देता है जो एक अनुभवी ट्रेकर चाहता है।' },
  land: { en: l => `It has the ${l.toLowerCase()} you asked for.`, hi: l => `इसमें वह है जो आपने चुना: ${l}।` },
  permit: { en: () => 'Note: special permits or rules apply — check before planning.', hi: () => 'ध्यान दें: विशेष परमिट या नियम लागू हैं — योजना से पहले जाँचें।' },
  local: { en: () => 'Note: access rules have changed recently; confirm locally.', hi: () => 'ध्यान दें: पहुँच के नियम हाल में बदले हैं; स्थानीय स्तर पर पुष्टि करें।' },
};

export function matchTreks(list, answers, lang = 'en', limit = 3) {
  const { month, days, experience, landscape } = answers;
  const dayOpt = DAY_OPTIONS.find(d => d.id === days);
  const monthN = month ? Number(month) : null;
  const say = (key, arg) => R[key][lang === 'hi' ? 'hi' : 'en'](arg);

  const results = [];
  list.forEach(t => {
    const reasons = [];
    const notes = [];
    let score = 0;

    if (monthN) {
      if (!t.months.includes(monthN)) return;
      const mName = pick(MONTHS[monthN - 1], lang);
      if (t.bestMonths.includes(monthN)) { score += 4; reasons.push(say('bestMonth', mName)); }
      else { score += 1; reasons.push(say('openMonth', mName)); }
    }

    if (dayOpt) {
      if (t.totalDays == null) return;
      const label = lang === 'hi' ? `${t.totalDays} दिन` : `${t.totalDays} days`;
      if (t.totalDays >= dayOpt.min && t.totalDays <= dayOpt.max) { score += 4; reasons.push(say('daysFit', label)); }
      else if (t.totalDays >= dayOpt.min - 1 && t.totalDays <= dayOpt.max + 2) { score += 1; reasons.push(say('daysNear', label)); }
      else return;
    }

    const d = difficultyIndex(t.difficulty);
    if (experience === 'first') {
      if (d > 2 || (t.maxAltitudeM || 0) > 4500) return;
      if (d <= 1) { score += 4; reasons.push(say('firstOk')); } else score += 1;
    } else if (experience === 'some') {
      if (d > 3) return;
      if (d >= 1 && d <= 2) { score += 3; reasons.push(say('someOk')); } else score += 1;
    } else if (experience === 'experienced') {
      if (d >= 3) { score += 3; reasons.push(say('expOk')); } else if (d === 2) score += 1;
    }

    if (landscape) {
      if (t.landscapes.includes(landscape)) { score += 3; reasons.push(say('land', pick(LANDSCAPES[landscape], lang))); }
    }

    if (t.hasItinerary) score += 0.5;          // we can show a full guide
    if (t.editorial?.label) score += 0.25;     // an editorial choice, never a fake rating
    if (t.specialPermit) notes.push(say('permit'));
    if (t.verification?.localCheck) { notes.push(say('local')); score -= 1; } // prefer routes without open access questions

    results.push({ trek: t, score, reasons, notes });
  });

  return results.sort((a, b) => b.score - a.score || a.trek.name.en.localeCompare(b.trek.name.en)).slice(0, limit);
}
