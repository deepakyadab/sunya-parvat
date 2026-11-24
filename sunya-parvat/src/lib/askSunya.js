/*
  Ask Sunya — a retrieval-only trek assistant.

  It answers ONLY from the site's published trek records (src/data/treks) and
  journal articles (src/data/journal.js). It never generates facts: if a field
  is missing it says so. Every factual answer links to the page it came from.
  There is no network call and no AI model; behaviour is fully predictable.
*/
import { treks as ALL_TREKS } from '../data/treks';
import { articles as ALL_ARTICLES } from '../data/journal';
import { regions, countries, months as MONTHS, guideRules, dayKinds } from '../data/taxonomy';
import { pick } from '../i18n';
import { normaliseText } from './catalog';
import { matchTreks } from './matcher';
import * as fmt from './format';

const has = (re, s) => re.test(s);

const RX = {
  devanagari: /[ऀ-ॿ]/,
  emergency: /\b(emergency|rescue|sos|injured|bleeding|accident|lost on|help me)\b|आपात|बचाव|घायल|दुर्घटना|फँस/,
  medical: /\b(symptom|symptoms|medicine|medication|diamox|acetazolamide|pregnan\w*|asthma|heart (condition|problem|disease)|blood pressure|bp|diabet\w*|doctor|pill|tablet)\b|दवा|डॉक्टर|गर्भ|अस्थमा|दिल की|मधुमेह|ब्लड प्रेशर/,
  live: /\b(weather|forecast|today|tomorrow|right now|currently|now open|is it open|open now|closed|closure|landslide|road status|snowfall now|this week)\b|मौसम का हाल|आज|कल|अभी|बंद है|खुला है|भूस्खलन/,
  booking: /\b(book|booking|price|prices|cost|costs|fee|fees|package|packages|slot|slots|join|batch|batches|pay)\b|बुक|बुकिंग|कीमत|ख़र्च|खर्च|पैसे|शुल्क|पैकेज/,
  compare: /\b(compare|comparison|vs|versus|difference|differences|better|or)\b|तुलना|अंतर|फ़र्क|फर्क|बेहतर|\sया\s/,
  itinerary: /\b(itinerary|day by day|day-by-day|schedule|daily plan|route|days look|each day|stages?)\b|कार्यक्रम|दिन-ब-दिन|हर दिन|रास्ता|मार्ग/,
  when: /\b(when|best time|which month|month|season|seasons)\b|कब|महीन|मौसम/,
  permit: /\b(permit|permits|permission|guide required|need a guide|guide|registration|inner line|ilp)\b|परमिट|अनुमति|गाइड|पंजीकरण/,
  difficulty: /\b(difficult|difficulty|hard|tough|easy|fitness|fit enough|altitude|height|how high|elevation)\b|कठिन|आसान|फ़िटनेस|फिटनेस|ऊँचाई|ऊंचाई/,
  reach: /\b(reach|get to|getting there|how to go|nearest|airport|railway|station|start point|starting point|start from)\b|पहुँच|पहुंच|कैसे जाएँ|कैसे जाए|स्टेशन|हवाई/,
  gear: /\b(gear|pack|packing|carry|clothes|clothing|shoes|equipment)\b|सामान|कपड़े|जूते/,
  find: /\b(suggest|recommend|which trek|what trek|find|good for|options|treks? for|treks? in)\b|सुझा|कौन सा ट्रेक|कौन-सा|ट्रेक बताओ|ट्रेक बताएं/,
  first: /\b(first|beginner|beginners|never trekked|newbie|novice|first-time)\b|पहला|पहली बार|शुरुआती/,
  experienced: /\b(experienced|advanced|challenging|high altitude|expert)\b|अनुभवी|चुनौती/,
  some: /\b(some experience|done one|done a few|second trek|intermediate)\b|एक-दो|दूसरा ट्रेक/,
  weekend: /\b(weekend|short trek|2 days|two days)\b|वीकेंड|सप्ताहांत/,
  greet: /^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|हेलो)\b/,
  thanks: /\b(thanks|thank you|dhanyavad|shukriya)\b|धन्यवाद|शुक्रिया/,
};

const LAND_WORDS = {
  lake: /\b(lake|lakes)\b|झील|ताल/, meadow: /\b(meadow|meadows|bugyal)\b|बुग्याल|घास/, pass: /\b(pass|crossing)\b|दर्रा|पास/,
  ridge: /\bridge\b|रिज/, forest: /\b(forest|jungle|woods)\b|जंगल|वन/, glacier: /\bglacier\b|ग्लेशियर|हिमनद/,
  summit: /\b(summit|peak|top)\b|शिखर|चोटी/, valley: /\bvalley\b|घाटी/, desert: /\b(desert|barren|rain shadow)\b|रेगिस्तान/,
  village: /\b(village|villages|culture|homestay)\b|गाँव|गांव/,
};

// "may" and "march" are also ordinary English words, so they need a time cue.
const MONTH_WORDS = MONTHS.map(m => {
  if (m.n === 5) return /\b(in|during|for|this|next|early|late|mid|of|by)\s+may\b|^may\b(?!\s+i\b)|मई/;
  if (m.n === 3) return /\b(in|during|for|this|next|early|late|mid|of|by)\s+(march|mar)\b|^march\b|मार्च/;
  return new RegExp(`\\b(${m.en.toLowerCase()}|${m.short.toLowerCase()})\\b|${m.hi}`);
});

/* ---------- copy ---------- */
const C = {
  en: {
    disclaimer: 'Confirm current weather, trail status and permits with local or official sources before you go.',
    unverified: 'These facts have not yet been verified by Sunya Parvat.',
    notAvailable: "The site doesn't have verified information on this yet.",
    emergency: "I can't help in an emergency. In India, call 112. Elsewhere, contact local police, your guide or your operator's emergency number straight away.",
    medical: "I can't give medical advice. For symptoms, medication or a health condition, please speak to a doctor. Our altitude awareness article covers general warning signs.",
    live: "I don't have live weather, road or trail-closure information. Check the forest department, local authorities or your operator for current conditions.",
    booking: 'Sunya Parvat does not run group treks or sell packages, so there are no prices or slots here. For a question, use the Connect page.',
    followUp: 'Happy to help you narrow it down. Which month are you thinking of, how many days do you have, and would this be your first trek?',
    greet: "Namaste. I can help you find a trek, compare two, explain an itinerary or point you to preparation guides. What would you like to know?",
    thanks: 'Glad to help. Walk well.',
    fallback: "I couldn't find that in the site's trek records or articles. Try a trek name, a month, or a topic such as packing, fitness or altitude.",
    found: n => `Here ${n === 1 ? 'is a trek' : `are ${n} treks`} that fit what you told me:`,
    noneFound: "No published trek matches all of that. Try a different month or a wider range of days.",
    addMore: 'Tell me your month, days or experience for a closer match.',
    compareIntro: (a, b) => `${a} and ${b}, side by side:`,
    compareOne: 'I found only one of those treks on the site. Which other trek do you want to compare it with?',
    itineraryIntro: (n, total, walk) => `${n}: ${total} total${walk ? `, ${walk} walking` : ''}.`,
    noItinerary: n => `There is no verified day-by-day itinerary for ${n} on the site yet.`,
    bestMonths: (n, best, all) => `Best months for ${n}: ${best}.${all && all !== best ? ` It is trekked from ${all}.` : ''}`,
    permits: n => `Permits and rules for ${n}:`,
    reach: n => `Getting to ${n}:`,
    gear: n => `Gear for ${n}:`,
    articleIntro: 'This article should help:',
    whichOne: names => `Which trek do you mean: ${names.join(' or ')}?`,
    notInCatalog: "That trek isn't on the site yet, so I don't have verified information about it. You can browse the treks we do cover.",
    browsePlace: p => `Browse treks in ${p}`,
    browseAll: 'Browse all treks',
    openTrek: n => `Open ${n}`,
    openCompare: 'Open the full comparison',
    readArticle: t => `Read: ${t}`,
    labels: { days: 'Duration', alt: 'Highest point', diff: 'Difficulty', best: 'Best months', start: 'Start', guide: 'Guide', permits: 'Permits' },
    suggestions: ['Suggest a first trek in December', 'Compare Kedarkantha and Brahmatal', 'Everest Base Camp itinerary', 'What should I pack?'],
  },
  hi: {
    disclaimer: 'जाने से पहले वर्तमान मौसम, रास्ते की स्थिति और परमिट की पुष्टि स्थानीय या आधिकारिक स्रोतों से करें।',
    unverified: 'इन तथ्यों का सत्यापन अभी शून्य पर्वत ने नहीं किया है।',
    notAvailable: 'साइट पर इस बारे में अभी सत्यापित जानकारी नहीं है।',
    emergency: 'मैं आपात स्थिति में मदद नहीं कर सकता। भारत में 112 पर कॉल करें। अन्यत्र, तुरंत स्थानीय पुलिस, अपने गाइड या ऑपरेटर के आपात नंबर पर संपर्क करें।',
    medical: 'मैं चिकित्सा सलाह नहीं दे सकता। लक्षण, दवा या किसी स्वास्थ्य समस्या के लिए कृपया डॉक्टर से बात करें। हमारा ऊँचाई वाला लेख सामान्य चेतावनी संकेत बताता है।',
    live: 'मेरे पास मौसम, सड़क या रास्ता बंद होने की ताज़ा जानकारी नहीं है। वर्तमान स्थिति के लिए वन विभाग, स्थानीय प्रशासन या अपने ऑपरेटर से पूछें।',
    booking: 'शून्य पर्वत समूह ट्रेक नहीं चलाता और पैकेज नहीं बेचता, इसलिए यहाँ कीमत या स्लॉट नहीं हैं। कोई सवाल हो तो संपर्क पेज देखें।',
    followUp: 'मैं चुनाव में मदद करूँगा। आप किस महीने जाना चाहते हैं, कितने दिन हैं, और क्या यह आपका पहला ट्रेक होगा?',
    greet: 'नमस्ते। मैं ट्रेक खोजने, दो ट्रेक की तुलना करने, यात्रा कार्यक्रम समझाने या तैयारी के लेख बताने में मदद कर सकता हूँ। आप क्या जानना चाहेंगे?',
    thanks: 'ख़ुशी हुई। अच्छे से चलिए।',
    fallback: 'साइट के ट्रेक रिकॉर्ड या लेखों में यह नहीं मिला। किसी ट्रेक का नाम, महीना, या सामान, फ़िटनेस या ऊँचाई जैसा विषय लिखकर देखें।',
    found: n => `आपकी बताई बातों के अनुसार ${n} ट्रेक:`,
    noneFound: 'कोई प्रकाशित ट्रेक इन सब से मेल नहीं खाता। कोई दूसरा महीना या दिनों की बड़ी सीमा आज़माएँ।',
    addMore: 'बेहतर मिलान के लिए अपना महीना, दिन या अनुभव बताएँ।',
    compareIntro: (a, b) => `${a} और ${b}, साथ-साथ:`,
    compareOne: 'मुझे साइट पर इनमें से केवल एक ट्रेक मिला। आप इसकी तुलना किस दूसरे ट्रेक से करना चाहते हैं?',
    itineraryIntro: (n, total, walk) => `${n}: कुल ${total}${walk ? `, ${walk} पैदल` : ''}।`,
    noItinerary: n => `${n} का सत्यापित दिन-ब-दिन कार्यक्रम अभी साइट पर नहीं है।`,
    bestMonths: (n, best, all) => `${n} के लिए सबसे अच्छे महीने: ${best}।${all && all !== best ? ` यह ${all} में किया जाता है।` : ''}`,
    permits: n => `${n} के परमिट और नियम:`,
    reach: n => `${n} कैसे पहुँचें:`,
    gear: n => `${n} के लिए सामान:`,
    articleIntro: 'यह लेख मदद करेगा:',
    whichOne: names => `आप किस ट्रेक की बात कर रहे हैं: ${names.join(' या ')}?`,
    notInCatalog: 'यह ट्रेक अभी साइट पर नहीं है, इसलिए मेरे पास इसकी सत्यापित जानकारी नहीं है। आप वे ट्रेक देख सकते हैं जो हमारे पास हैं।',
    browsePlace: p => `${p} के ट्रेक देखें`,
    browseAll: 'सभी ट्रेक देखें',
    openTrek: n => `${n} देखें`,
    openCompare: 'पूरी तुलना देखें',
    readArticle: t => `पढ़ें: ${t}`,
    labels: { days: 'अवधि', alt: 'सबसे ऊँचा बिंदु', diff: 'कठिनाई', best: 'सबसे अच्छे महीने', start: 'शुरुआत', guide: 'गाइड', permits: 'परमिट' },
    suggestions: ['दिसंबर में पहला ट्रेक सुझाएँ', 'केदारकांठा और ब्रह्मताल की तुलना', 'एवरेस्ट बेस कैंप का कार्यक्रम', 'क्या सामान ले जाऊँ?'],
  },
};

/* ---------- entity extraction ---------- */

function findTreks(text, list) {
  const padded = ' ' + text + ' ';
  const hits = [];
  list.forEach(t => {
    const names = [t.id.replace(/-/g, ' '), t.name.en, t.name.hi, ...(t.aliases || [])]
      .filter(Boolean).map(normaliseText).filter(n => n.length >= 3);
    let best = null;
    names.forEach(n => {
      const i = padded.indexOf(' ' + n + ' ');
      if (i < 0) return;
      // prefer the longest name found (e.g. "everest three passes" over "everest")
      if (!best || n.length > best.len) best = { at: i, len: n.length };
    });
    if (best) hits.push({ t, ...best });
  });
  // Drop a match that sits inside a longer match for another trek.
  const kept = hits.filter(h => !hits.some(o => o !== h && o.len > h.len && o.at <= h.at && o.at + o.len >= h.at + h.len));
  return kept.sort((a, b) => a.at - b.at).map(h => h.t);
}

function findMonth(text) {
  for (let i = 0; i < 12; i++) if (MONTH_WORDS[i].test(text)) return i + 1;
  return null;
}

function findDays(text) {
  if (RX.weekend.test(text)) return 'weekend';
  const m = text.match(/(\d{1,2})\s*(?:days?|din|दिन)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n <= 3) return 'weekend';
  if (n <= 6) return 'short';
  if (n <= 10) return 'week';
  return 'long';
}

function findPlace(text) {
  for (const [id, r] of Object.entries(regions)) {
    if (text.includes(normaliseText(r.en)) || (r.hi && text.includes(normaliseText(r.hi)))) return { region: id };
  }
  for (const [id, c] of Object.entries(countries)) {
    if (text.includes(normaliseText(c.en)) || (c.hi && text.includes(normaliseText(c.hi)))) return { country: id };
  }
  if (/\b(himachal)\b|हिमाचल/.test(text)) return { region: 'himachal' };
  if (/\b(kashmir)\b|कश्मीर/.test(text)) return { region: 'kashmir' };
  if (/\b(sikkim)\b|सिक्किम/.test(text)) return { region: 'sikkim' };
  return null;
}

function findLandscape(text) {
  return Object.keys(LAND_WORDS).find(k => LAND_WORDS[k].test(text)) || null;
}

function findArticles(text, lang) {
  const scored = ALL_ARTICLES.map(a => {
    let s = 0;
    (a.topics || []).forEach(tp => { if (text.includes(normaliseText(tp))) s += 2; });
    if (a.kind === 'guide') s += 0.5;
    if (a.languages.includes(lang)) s += 0.25;
    return { a, s };
  }).filter(x => x.s >= 2).sort((x, y) => y.s - x.s);
  return scored.map(x => x.a);
}

/* ---------- answer builders ---------- */

function trekLink(t, lang) { return { to: `/treks/${t.id}`, label: C[lang].openTrek(pick(t.name, lang)) }; }
function articleLink(a, lang) { return { to: `/journal/${a.id}`, label: C[lang].readArticle(pick(a.title, lang)) }; }

function verificationNote(t, lang) {
  const notes = [];
  if (t.verification?.localCheck) notes.push('⚠ ' + pick(t.verification.localCheck, lang));
  if (t.verification?.status !== 'verified') notes.push(C[lang].unverified);
  return notes;
}

function factsLines(t, lang) {
  const L = C[lang].labels;
  const na = lang === 'hi' ? 'सत्यापित नहीं' : 'Not verified';
  return [
    `• ${L.days}: ${fmt.days(t.totalDays, lang) || na}`,
    `• ${L.alt}: ${fmt.altitude(t.maxAltitudeM, lang) || na}`,
    `• ${L.diff}: ${fmt.difficultyName(t.difficulty, lang)}`,
    `• ${L.best}: ${fmt.monthRange(t.bestMonths, lang) || na}`,
    `• ${L.start}: ${pick(t.start, lang) || na}`,
  ];
}

function answerTrek(t, text, lang) {
  const c = C[lang];
  const name = pick(t.name, lang);
  const lines = [];
  const links = [trekLink(t, lang)];

  if (has(RX.itinerary, text)) {
    if (!t.hasItinerary) {
      lines.push(c.noItinerary(name), ...factsLines(t, lang));
    } else {
      lines.push(c.itineraryIntro(name, fmt.days(t.totalDays, lang), fmt.days(t.walkingDays, lang)));
      t.itinerary.forEach(d => {
        const kind = d.kind && d.kind !== 'trek' ? ` (${pick(dayKinds[d.kind], lang)})` : '';
        const alt = d.altitudeM ? ` · ${fmt.altitude(d.altitudeM, lang)}` : '';
        lines.push(`• ${lang === 'hi' ? 'दिन' : 'Day'} ${d.day}: ${pick(d.route, lang)}${kind}${alt}`);
      });
      if (t.durationNote) lines.push(pick(t.durationNote, lang));
    }
  } else if (has(RX.when, text)) {
    lines.push(c.bestMonths(name, fmt.monthRange(t.bestMonths, lang, true), fmt.monthRange(t.months, lang, true)));
  } else if (has(RX.permit, text)) {
    lines.push(c.permits(name));
    lines.push(t.permits ? pick(t.permits, lang) : c.notAvailable);
    if (t.guide) lines.push(`• ${pick(guideRules[t.guide], lang)}`);
  } else if (has(RX.reach, text)) {
    lines.push(c.reach(name));
    lines.push(t.reach ? pick(t.reach, lang) : `${c.notAvailable} ${C[lang].labels.start}: ${pick(t.start, lang) || '—'}`);
  } else if (has(RX.gear, text)) {
    lines.push(c.gear(name));
    lines.push(t.gear ? pick(t.gear, lang) : c.notAvailable);
    const packing = ALL_ARTICLES.find(a => a.id === 'packing-for-a-himalayan-trek');
    if (packing) links.push(articleLink(packing, lang));
  } else if (has(RX.difficulty, text)) {
    lines.push(...factsLines(t, lang));
    if (t.fitness) lines.push(pick(t.fitness, lang));
    if (t.altitudeNote) lines.push(pick(t.altitudeNote, lang));
  } else {
    lines.push(`${name} — ${pick(t.highlight, lang)}`);
    lines.push(...factsLines(t, lang));
  }

  lines.push(...verificationNote(t, lang));
  return { text: lines.join('\n'), links, disclaimer: c.disclaimer, treks: [t.id] };
}

function answerCompare(a, b, lang) {
  const c = C[lang];
  const L = c.labels;
  const na = lang === 'hi' ? 'सत्यापित नहीं' : 'Not verified';
  const row = (label, f) => `• ${label}: ${pick(a.name, lang)} — ${f(a) || na}; ${pick(b.name, lang)} — ${f(b) || na}`;
  const lines = [
    c.compareIntro(pick(a.name, lang), pick(b.name, lang)),
    row(L.days, t => fmt.days(t.totalDays, lang)),
    row(L.alt, t => fmt.altitude(t.maxAltitudeM, lang)),
    row(L.diff, t => fmt.difficultyName(t.difficulty, lang)),
    row(L.best, t => fmt.monthRange(t.bestMonths, lang)),
    row(L.guide, t => t.guide && pick(guideRules[t.guide], lang)),
  ];
  [a, b].forEach(t => { if (t.verification?.localCheck) lines.push(`⚠ ${pick(t.name, lang)}: ${pick(t.verification.localCheck, lang)}`); });
  lines.push(c.unverified);
  return {
    text: lines.join('\n'),
    links: [{ to: `/compare?ids=${a.id},${b.id}`, label: c.openCompare }, trekLink(a, lang), trekLink(b, lang)],
    disclaimer: c.disclaimer,
    treks: [a.id, b.id],
  };
}

/* ---------- main ---------- */

export function askSunya(question, { lang: siteLang = 'en', context = {} } = {}) {
  const raw = String(question || '').trim();
  const lang = RX.devanagari.test(raw) ? 'hi' : siteLang;
  const c = C[lang];
  const text = normaliseText(raw);
  const low = raw.toLowerCase();

  if (!text) return { text: c.greet, suggestions: c.suggestions, lang };
  if (has(RX.emergency, low)) return { text: c.emergency, lang, kind: 'safety' };

  const mentioned = findTreks(text, ALL_TREKS);
  const altitudeArticle = ALL_ARTICLES.find(a => a.id === 'altitude-awareness');

  if (has(RX.medical, low)) {
    return { text: c.medical, links: altitudeArticle ? [articleLink(altitudeArticle, lang)] : [], lang, kind: 'safety' };
  }
  if (has(RX.booking, low) && !has(RX.permit, low)) {
    return { text: c.booking, links: [{ to: '/connect', label: lang === 'hi' ? 'संपर्क करें' : 'Connect' }], lang };
  }
  if (has(RX.live, low)) {
    const extra = mentioned[0] ? answerTrek(mentioned[0], 'when', lang) : null;
    return {
      text: c.live + (extra ? '\n\n' + extra.text : ''),
      links: extra ? extra.links : [], disclaimer: extra ? c.disclaimer : undefined, lang,
    };
  }

  // Comparison: two named treks, or "compare X" with a trek from earlier in the chat.
  if (has(RX.compare, low) && mentioned.length >= 2) return { ...answerCompare(mentioned[0], mentioned[1], lang), lang };
  if (/\b(compare|comparison|vs|versus)\b|तुलना/.test(low) && mentioned.length === 1) {
    const prev = (context.lastTreks || []).map(id => ALL_TREKS.find(t => t.id === id)).find(t => t && t.id !== mentioned[0].id);
    if (prev) return { ...answerCompare(prev, mentioned[0], lang), lang };
    return { text: c.compareOne, links: [trekLink(mentioned[0], lang)], lang, treks: [mentioned[0].id] };
  }

  if (mentioned.length >= 1) return { ...answerTrek(mentioned[0], low, lang), lang };

  // A follow-up about "it" refers to the last trek discussed.
  const followUpTopic = [RX.itinerary, RX.when, RX.permit, RX.reach, RX.gear, RX.difficulty].some(r => has(r, low));
  const pronoun = /\b(it|its|this|that|there|them|both)\b|इसका|इसके|इसमें|वहाँ|यह|इनका/.test(low);
  const prevTreks = (context.lastTreks || []).map(id => ALL_TREKS.find(t => t.id === id)).filter(Boolean);
  if (followUpTopic && pronoun && prevTreks.length && !has(RX.find, low)) {
    if (prevTreks.length === 1) return { ...answerTrek(prevTreks[0], low, lang), lang };
    const names = prevTreks.map(t => pick(t.name, lang));
    const TOPIC = [
      [RX.itinerary, { en: 'itinerary', hi: 'का कार्यक्रम' }], [RX.when, { en: 'best time', hi: 'कब जाएँ' }],
      [RX.permit, { en: 'permits', hi: 'के परमिट' }], [RX.reach, { en: 'how to reach', hi: 'कैसे पहुँचें' }],
      [RX.gear, { en: 'gear', hi: 'का सामान' }], [RX.difficulty, { en: 'difficulty', hi: 'कितना कठिन' }],
    ].find(([r]) => has(r, low));
    const topic = TOPIC ? TOPIC[1][lang] : '';
    return { text: c.whichOne(names), suggestions: names.map(n => `${n} ${topic}`.trim()), lang, kind: 'follow-up' };
  }

  // A named trek we do not have: say so plainly instead of guessing.
  const asksAbout = /\b(tell me about|what about|about the|details of|information on|info on|what is the)\b|के बारे में|की जानकारी/.test(low);
  const generalAsk = findMonth(low) || findDays(low) || /\btreks\b|ट्रेक्स|सभी ट्रेक/.test(low);
  if (asksAbout && !generalAsk && !findArticles(text, lang).length) {
    const place = findPlace(text);
    const link = place?.country ? { to: `/treks?country=${place.country}`, label: c.browsePlace(pick(countries[place.country], lang)) }
      : place?.region ? { to: `/treks?region=${place.region}`, label: c.browsePlace(pick(regions[place.region], lang)) }
      : { to: '/treks', label: c.browseAll };
    return { text: c.notInCatalog, links: [link], lang };
  }

  // Find-a-trek
  const month = findMonth(low);
  const days = findDays(low);
  const experience = has(RX.first, low) ? 'first' : has(RX.some, low) ? 'some' : has(RX.experienced, low) ? 'experienced' : null;
  const landscape = findLandscape(low);
  const place = findPlace(text);
  const wantsFind = has(RX.find, low) || /\btrek|ट्रेक/.test(low);
  const signals = [month, days, experience].filter(Boolean).length;

  // Preparation topics → articles (unless the visitor is clearly asking for treks).
  const arts = findArticles(text, lang);
  if (arts.length && !(wantsFind && signals)) {
    const a = arts[0];
    return {
      text: `${c.articleIntro}\n${pick(a.title, lang)} — ${pick(a.summary, lang)}`,
      links: arts.slice(0, 2).map(x => articleLink(x, lang)),
      disclaimer: a.safety ? c.disclaimer : undefined,
      lang,
    };
  }

  if (signals || (wantsFind && (landscape || place))) {
    if (!signals) return { text: c.followUp, suggestions: lang === 'hi' ? ['दिसंबर, 6 दिन, पहला ट्रेक', 'अक्टूबर, 10 दिन, अनुभवी'] : ['December, 6 days, first trek', 'October, 10 days, experienced'], lang, kind: 'follow-up' };
    let pool = ALL_TREKS;
    if (place?.region) pool = pool.filter(t => t.region === place.region);
    if (place?.country) pool = pool.filter(t => t.countries.includes(place.country));
    const results = matchTreks(pool, { month, days, experience, landscape }, lang, 3);
    if (!results.length) return { text: c.noneFound, lang };
    const lines = [c.found(results.length)];
    results.forEach(r => {
      lines.push(`• ${pick(r.trek.name, lang)} (${fmt.days(r.trek.totalDays, lang)}, ${fmt.difficultyName(r.trek.difficulty, lang)}) — ${r.reasons.join(' ')}`);
      r.notes.forEach(n => lines.push(`  ${n}`));
    });
    if (signals < 2) lines.push(c.addMore);
    return {
      text: lines.join('\n'),
      links: results.map(r => trekLink(r.trek, lang)),
      disclaimer: c.disclaimer,
      treks: results.map(r => r.trek.id),
      lang,
    };
  }

  if (wantsFind || place) return { text: c.followUp, lang, kind: 'follow-up' };
  if (has(RX.greet, low)) return { text: c.greet, suggestions: c.suggestions, lang };
  if (has(RX.thanks, low)) return { text: c.thanks, lang };
  return { text: c.fallback, suggestions: c.suggestions, lang };
}

export const botSuggestions = lang => C[lang === 'hi' ? 'hi' : 'en'].suggestions;
