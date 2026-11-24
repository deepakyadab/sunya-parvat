/*
  Shared vocabularies for the trek catalog.
  Every trek record refers to these ids, so filters, cards, comparison,
  the trek guide and Ask Sunya all read the same labels in English and Hindi.
  To add a new region or type: add it here, then use its id in a trek file.
*/

export const countries = {
  india: { en: 'India', hi: 'भारत' },
  nepal: { en: 'Nepal', hi: 'नेपाल' },
  bhutan: { en: 'Bhutan', hi: 'भूटान' },
  france: { en: 'France', hi: 'फ़्रांस' },
  italy: { en: 'Italy', hi: 'इटली' },
  switzerland: { en: 'Switzerland', hi: 'स्विट्ज़रलैंड' },
  spain: { en: 'Spain', hi: 'स्पेन' },
  peru: { en: 'Peru', hi: 'पेरू' },
  tanzania: { en: 'Tanzania', hi: 'तंज़ानिया' },
  kenya: { en: 'Kenya', hi: 'केन्या' },
  iceland: { en: 'Iceland', hi: 'आइसलैंड' },
  scotland: { en: 'Scotland (UK)', hi: 'स्कॉटलैंड (यूके)' },
  chile: { en: 'Chile', hi: 'चिली' },
  australia: { en: 'Australia', hi: 'ऑस्ट्रेलिया' },
  japan: { en: 'Japan', hi: 'जापान' },
};

export const regions = {
  uttarakhand: { country: 'india', en: 'Uttarakhand', hi: 'उत्तराखंड' },
  himachal: { country: 'india', en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  kashmir: { country: 'india', en: 'Jammu & Kashmir', hi: 'जम्मू और कश्मीर' },
  ladakh: { country: 'india', en: 'Ladakh', hi: 'लद्दाख' },
  sikkim: { country: 'india', en: 'Sikkim', hi: 'सिक्किम' },
  'west-bengal': { country: 'india', en: 'West Bengal', hi: 'पश्चिम बंगाल' },
  nagaland: { country: 'india', en: 'Nagaland', hi: 'नागालैंड' },
  meghalaya: { country: 'india', en: 'Meghalaya', hi: 'मेघालय' },
  karnataka: { country: 'india', en: 'Karnataka', hi: 'कर्नाटक' },
  kerala: { country: 'india', en: 'Kerala', hi: 'केरल' },
  maharashtra: { country: 'india', en: 'Maharashtra', hi: 'महाराष्ट्र' },
  khumbu: { country: 'nepal', en: 'Khumbu (Everest)', hi: 'खुम्बू (एवरेस्ट)' },
  annapurna: { country: 'nepal', en: 'Annapurna', hi: 'अन्नपूर्णा' },
  langtang: { country: 'nepal', en: 'Langtang', hi: 'लांगटांग' },
  manaslu: { country: 'nepal', en: 'Manaslu', hi: 'मनास्लु' },
  'east-nepal': { country: 'nepal', en: 'Eastern Nepal', hi: 'पूर्वी नेपाल' },
  mustang: { country: 'nepal', en: 'Mustang', hi: 'मुस्तांग' },
  paro: { country: 'bhutan', en: 'Paro & Thimphu', hi: 'पारो और थिम्फू' },
  alps: { country: 'france', en: 'Mont Blanc massif', hi: 'मों ब्लां पर्वत-समूह' },
  galicia: { country: 'spain', en: 'Northern Spain', hi: 'उत्तरी स्पेन' },
  cusco: { country: 'peru', en: 'Cusco region', hi: 'कुस्को क्षेत्र' },
  kilimanjaro: { country: 'tanzania', en: 'Kilimanjaro region', hi: 'किलिमंजारो क्षेत्र' },
  'mount-kenya': { country: 'kenya', en: 'Mount Kenya', hi: 'माउंट केन्या' },
  'south-iceland': { country: 'iceland', en: 'South Iceland highlands', hi: 'दक्षिण आइसलैंड हाइलैंड्स' },
  highlands: { country: 'scotland', en: 'Scottish Highlands', hi: 'स्कॉटिश हाइलैंड्स' },
  patagonia: { country: 'chile', en: 'Patagonia', hi: 'पेटागोनिया' },
  tasmania: { country: 'australia', en: 'Tasmania', hi: 'तस्मानिया' },
  kii: { country: 'japan', en: 'Kii Peninsula', hi: 'की प्रायद्वीप' },
};

/* Difficulty is ordered: the index is used for sorting and matching. */
export const difficulties = [
  { id: 'easy', en: 'Easy', hi: 'आसान', fitness: { en: 'Comfortable walking 4–5 hours with breaks.', hi: 'आराम से 4–5 घंटे चलने की क्षमता, बीच में विश्राम के साथ।' } },
  { id: 'easy-moderate', en: 'Easy–moderate', hi: 'आसान–मध्यम', fitness: { en: 'Regular walker; can climb for 2–3 hours at a stretch.', hi: 'नियमित पैदल चलने वाले; लगातार 2–3 घंटे चढ़ाई कर सकें।' } },
  { id: 'moderate', en: 'Moderate', hi: 'मध्यम', fitness: { en: '5–7 hour days on uneven terrain; some prior trekking helps.', hi: 'ऊबड़-खाबड़ रास्ते पर 5–7 घंटे के दिन; पहले का ट्रेकिंग अनुभव सहायक है।' } },
  { id: 'difficult', en: 'Difficult', hi: 'कठिन', fitness: { en: 'Prior high-altitude treks; long days, steep or snow sections.', hi: 'पहले ऊँचाई वाले ट्रेक का अनुभव; लंबे दिन, खड़ी या बर्फ़ीली चढ़ाई।' } },
  { id: 'very-difficult', en: 'Very difficult', hi: 'बहुत कठिन', fitness: { en: 'Experienced trekkers only; remote terrain, high passes, technical sections possible.', hi: 'केवल अनुभवी ट्रेकर; दूरस्थ इलाक़ा, ऊँचे दर्रे, तकनीकी हिस्से संभव।' } },
];
export const difficultyIndex = id => difficulties.findIndex(d => d.id === id);

export const experienceTypes = {
  beginner: { en: 'Beginner-friendly', hi: 'शुरुआती के लिए' },
  weekend: { en: 'Weekend (1–3 days)', hi: 'वीकेंड (1–3 दिन)' },
  family: { en: 'Family-friendly', hi: 'परिवार के लिए' },
  'high-altitude': { en: 'High altitude', hi: 'अधिक ऊँचाई' },
  pilgrimage: { en: 'Pilgrimage & sacred', hi: 'तीर्थ और पवित्र स्थल' },
  expedition: { en: 'Expedition-style', hi: 'अभियान-शैली' },
  winter: { en: 'Winter snow', hi: 'सर्दियों की बर्फ़' },
  'monsoon-friendly': { en: 'Good in monsoon', hi: 'मानसून में उपयुक्त' },
  'long-distance': { en: 'Long-distance walk', hi: 'लंबी दूरी की पदयात्रा' },
};

export const landscapes = {
  meadow: { en: 'Meadows', hi: 'बुग्याल / घास के मैदान' },
  lake: { en: 'Lakes', hi: 'झीलें' },
  pass: { en: 'Pass crossing', hi: 'दर्रा पार करना' },
  ridge: { en: 'Ridge walk', hi: 'रिज पर चलना' },
  forest: { en: 'Forest', hi: 'जंगल' },
  glacier: { en: 'Glacier', hi: 'ग्लेशियर' },
  summit: { en: 'Summit', hi: 'शिखर' },
  valley: { en: 'Valley', hi: 'घाटी' },
  desert: { en: 'High desert', hi: 'ऊँचा रेगिस्तान' },
  village: { en: 'Villages & culture', hi: 'गाँव और संस्कृति' },
};

export const editorialLabels = {
  classic: { en: 'Classic', hi: 'क्लासिक' },
  'editors-pick': { en: "Editor's pick", hi: 'संपादक की पसंद' },
  quieter: { en: 'Quieter route', hi: 'शांत रास्ता' },
  popular: { en: 'Popular', hi: 'लोकप्रिय' },
};

export const dayKinds = {
  travel: { en: 'Travel day', hi: 'यात्रा का दिन' },
  trek: { en: 'Trekking day', hi: 'ट्रेकिंग का दिन' },
  summit: { en: 'Summit / pass day', hi: 'शिखर / दर्रा दिवस' },
  acclimatisation: { en: 'Acclimatisation day', hi: 'अनुकूलन (एक्लिमटाइज़ेशन) दिवस' },
  buffer: { en: 'Buffer day', hi: 'बफ़र दिवस' },
  rest: { en: 'Rest day', hi: 'विश्राम दिवस' },
};

export const guideRules = {
  required: { en: 'Licensed guide required', hi: 'लाइसेंसधारी गाइड अनिवार्य' },
  recommended: { en: 'Guide recommended', hi: 'गाइड की सलाह दी जाती है' },
  'not-required': { en: 'Independent trekking possible', hi: 'स्वतंत्र ट्रेकिंग संभव' },
};

export const months = [
  { n: 1, en: 'January', short: 'Jan', hi: 'जनवरी' },
  { n: 2, en: 'February', short: 'Feb', hi: 'फ़रवरी' },
  { n: 3, en: 'March', short: 'Mar', hi: 'मार्च' },
  { n: 4, en: 'April', short: 'Apr', hi: 'अप्रैल' },
  { n: 5, en: 'May', short: 'May', hi: 'मई' },
  { n: 6, en: 'June', short: 'Jun', hi: 'जून' },
  { n: 7, en: 'July', short: 'Jul', hi: 'जुलाई' },
  { n: 8, en: 'August', short: 'Aug', hi: 'अगस्त' },
  { n: 9, en: 'September', short: 'Sep', hi: 'सितंबर' },
  { n: 10, en: 'October', short: 'Oct', hi: 'अक्टूबर' },
  { n: 11, en: 'November', short: 'Nov', hi: 'नवंबर' },
  { n: 12, en: 'December', short: 'Dec', hi: 'दिसंबर' },
];

/*
  Seasons are derived from months, never stored separately on a trek,
  so a card, a filter and a detail page can no longer disagree.
  (Northern-hemisphere framing; southern routes still filter correctly by month.)
*/
export const seasons = [
  { id: 'winter', months: [12, 1, 2], en: 'Winter', hi: 'सर्दी', color: '#c8d8e8',
    tagline: { en: 'Snow, silence, and a particular kind of loneliness that heals', hi: 'बर्फ़, मौन, और एक ऐसा एकांत जो भीतर तक भर देता है' } },
  { id: 'spring', months: [3, 4, 5], en: 'Spring', hi: 'वसंत', color: '#c4d4b0',
    tagline: { en: 'When the mountains begin again, so do you', hi: 'जब पहाड़ फिर से शुरू होते हैं, आप भी' } },
  { id: 'monsoon', months: [6, 7, 8], en: 'Summer & monsoon', hi: 'गर्मी और मानसून', color: '#8fa8b0',
    tagline: { en: 'Raw, green, and completely honest', hi: 'कच्चा, हरा, और पूरी तरह सच्चा' } },
  { id: 'autumn', months: [9, 10, 11], en: 'Autumn', hi: 'शरद', color: '#c4a870',
    tagline: { en: 'Clarity, after the rain', hi: 'बारिश के बाद की स्पष्टता' } },
];

export const durationBuckets = [
  { id: '1-3', min: 1, max: 3, en: '1–3 days', hi: '1–3 दिन' },
  { id: '4-7', min: 4, max: 7, en: '4–7 days', hi: '4–7 दिन' },
  { id: '8-12', min: 8, max: 12, en: '8–12 days', hi: '8–12 दिन' },
  { id: '13+', min: 13, max: 999, en: '13+ days', hi: '13+ दिन' },
];
