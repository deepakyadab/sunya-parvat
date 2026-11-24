/*
  Journal articles.
  - `languages` lists the languages an article is actually written in.
    An English-only article is shown with an "English" badge in Hindi mode
    rather than being machine-translated.
  - `hiReviewed: false` marks Hindi copy that still needs review by a fluent
    Hindi editor. Safety-related articles show a note until it is reviewed.
  - Body text: blank-line separated paragraphs. "## " starts a heading, "- " a bullet.
  - `topics` are plain keywords used by Ask Sunya to find the right article.
*/

const reflections = [
  {
    id: 'what-altitude-does', kind: 'reflection', languages: ['en'],
    title: { en: 'What altitude actually does to you' },
    subtitle: { en: 'It is not what the guide books say' },
    summary: { en: "They tell you about the headache. The breathlessness. They don't tell you about the way your priorities rearrange themselves somewhere above 3,500 metres." },
    date: '2024-10-01', readTime: 6, relatedTreks: ['roopkund', 'everest-base-camp'], topics: ['altitude', 'reflection'],
    body: { en: `They tell you about the headache. About the nausea that can arrive at 3,500 metres if you go too fast. They tell you to drink water, to ascend slowly, to watch for signs.

They don't tell you about the other thing.

The other thing is harder to name. It begins somewhere around day two or three, when the noise of your ordinary life has finally lost transmission. When the last email has stopped mattering.

What fills the space is surprising. Not peace — at least not immediately. First there is restlessness. Then boredom. Then, if you stay with it, something that begins to feel like presence.

At altitude, the body is occupied with something real: the work of breathing, the management of temperature, the attention required to place one foot correctly. The body is busy in the most honest way a body can be busy.

And the mind, freed from its usual performance, begins to slow.

I have noticed this across many mountains and many people. The quietest people at camp on day four are often those who arrived the loudest. Something happens to urgency up there.

What you are left with is something resembling yourself. Not the self you present. The self that was there before you had to present anything.

The mountain did not create this. It only cleared the path to it.` },
  },
  {
    id: 'the-cook-at-camp', kind: 'reflection', languages: ['en'],
    title: { en: 'The cook at camp who said nothing important' },
    subtitle: { en: 'And everything necessary' },
    summary: { en: 'He made dal every night for eight days. Always on time. Always the right temperature. I never asked him why he was there and he never asked me.' },
    date: '2024-09-01', readTime: 4, relatedTreks: [], topics: ['reflection', 'people'],
    body: { en: `His name was Mohan. He appeared at camp each morning before the sun, and the first thing you saw, coming out of your tent, was the small orange glow of the gas stove and the shape of him crouching beside it.

He made dal every night for eight days. Always on time. Always the right temperature.

On the third night I sat near him while he cooked and asked how long he had been doing this. He said something about many seasons. He didn't elaborate. I didn't push.

What I understood: he believed that food at camp needed to be simple because the environment was already complicated. A person who is cold and tired does not need complexity — they need temperature and salt.

We are surrounded by complexity that we have convinced ourselves is sophistication. The cook at camp knew the difference.

He fed us every night. That was the whole thing. That was enough.` },
  },
  {
    id: 'first-time-at-roopkund', kind: 'reflection', languages: ['en'],
    title: { en: 'First time at Roopkund — what I expected and what I found' },
    subtitle: { en: 'The gap between preparation and arrival' },
    summary: { en: 'I had read everything. I had trained. I had the right gear. And then the lake appeared and none of that mattered and all of it mattered.' },
    date: '2024-08-01', readTime: 8, relatedTreks: ['roopkund'], topics: ['roopkund', 'reflection'],
    body: { en: `I had read everything.

I had read the accounts of other trekkers, the altitude data, the archaeological reports about the bones. I had trained on stairs with a loaded pack for six weeks. I had broken in my boots properly.

And then I was there.

The lake appears without ceremony. The trail rounds a moraine and the lake is simply present — a dark eye in the rock, partially iced even in September.

No one knows with complete certainty why the remains are here. There are theories. None of them is conclusive.

Standing there, I found that knowing and understanding are entirely different countries.

The preparation had been for the body. The body arrived fine. The thing I had not prepared was the part that stood at the edge of that lake and understood that something very human had happened here, and the mountain had simply held it.

I stayed longer than anyone in my group. No one said anything about it. That silence is also part of what the mountain offered.` },
  },
  {
    id: 'on-not-summiting', kind: 'reflection', languages: ['en'],
    title: { en: 'On not summiting — and why it was enough' },
    subtitle: { en: 'A meditation on the threshold' },
    summary: { en: 'We turned back 200 metres from the top. Weather, and something else. Something in me that knew this was enough for today.' },
    date: '2024-07-01', readTime: 5, relatedTreks: [], topics: ['summit', 'turnaround', 'reflection'],
    body: { en: `We turned back 200 metres from the top.

The weather was part of it. The clouds had arrived quickly and the wind was making the ridge genuinely difficult. The guide made the call. I agreed with it.

But there was something else. Something in me had already felt complete. Not defeated. Complete.

There is a version of the summit obsession that is about proving something to yourself. And there is a version that is simply about the specific beauty of being at the highest point. The first version can make turning back feel like failure.

The mountain does not care about your completion rate. It offered you a day. What you did with it is what matters.` },
  },
  {
    id: 'winter-solo', kind: 'reflection', languages: ['en'],
    title: { en: 'A winter morning alone at 4,000 metres' },
    subtitle: { en: 'Before the rest of the camp woke' },
    summary: { en: 'I woke at 4am without an alarm. Stepped outside. The stars were still there. The mountains were there. I was there.' },
    date: '2024-01-01', readTime: 3, relatedTreks: ['brahmatal'], topics: ['winter', 'reflection'],
    body: { en: `I woke at 4am without an alarm.

The tent was silent. I put on my down jacket over my sleeping clothes and stepped out.

There was no moon. The Milky Way was overhead and fully visible, not as a concept but as a physical river of light.

The mountains around camp were dark shapes against a slightly less dark sky. Trishul to the north. The Nanda Ghunti ridge.

I stood there for maybe forty minutes. No phone. No camera. Thoughts arrived and passed without accumulating.

I did not tell anyone about this the next morning. It felt like it belonged to the night and to the mountain and to me.` },
  },
  {
    id: 'phone-free-trek', kind: 'guide', languages: ['en'],
    title: { en: 'How to leave your phone behind on a trek' },
    subtitle: { en: 'Practically and psychologically' },
    summary: { en: 'It sounds obvious. It is not. The anxiety of disconnection is real. Here is what helps — not to cure it, but to let it pass.' },
    date: '2024-06-01', readTime: 5, relatedTreks: [], topics: ['phone', 'disconnect', 'mindset'],
    body: { en: `The anxiety arrives on day one, usually in the afternoon. The hand moves toward the pocket and finds nothing — or finds the phone, with no signal.

This moment tells you something about the dependency you've built. Not a moral failing. Just a fact about modern nervous systems.

## What helps
- Tell family your route, your operator's contact and the date you expect to have signal again. Then you don't need to check.
- Turn the phone off completely rather than leaving it in airplane mode. A phone in airplane mode is still waiting.
- Keep it for emergencies and photographs only, in the bottom of your pack.

By day three, something shifts. The attention the phone consumed becomes available for other things: the way light moves through a forest, the sound of a stream, conversations that happen when people are not dividing their attention.` },
  },
];

const guides = [
  {
    id: 'choosing-your-first-trek', kind: 'guide', languages: ['en', 'hi'], hiReviewed: false,
    title: { en: 'Choosing your first trek', hi: 'अपना पहला ट्रेक कैसे चुनें' },
    subtitle: { en: 'Four questions that narrow it down', hi: 'चार सवाल जो चुनाव आसान करते हैं' },
    summary: { en: 'Start with the month you can travel, the days you have, and an honest look at your fitness. The right first trek is the one you finish wanting another.', hi: 'उस महीने से शुरू करें जब आप जा सकते हैं, आपके पास कितने दिन हैं, और अपनी फ़िटनेस का ईमानदार आकलन। सही पहला ट्रेक वह है जिसके बाद आप एक और करना चाहें।' },
    date: '2026-11-20', readTime: 5, relatedTreks: ['kedarkantha', 'kuari-pass', 'valley-of-flowers', 'triund'],
    topics: ['first trek', 'beginner', 'choose', 'which trek', 'पहला ट्रेक', 'शुरुआती'],
    body: {
      en: `## 1. When can you go?
Season decides more than anything else. Winter (December–February) means snow treks like Kedarkantha and Kuari Pass. July–August is monsoon, when Valley of Flowers and Ladakh's rain-shadow treks shine. Spring and autumn open most high routes.

## 2. How many days do you really have?
Count travel. Most Himalayan treks need a full day of road travel at each end. A "6-day trek" from Dehradun is often 8 days from Delhi.

## 3. How fit are you, honestly?
For a first trek, aim for routes marked Easy or Easy–moderate and a maximum altitude below about 4,000 m. If you can jog 5 km in 40 minutes and climb stairs for 30 minutes, you are in a good place to start.

## 4. What do you want to see?
Snow, meadows, a lake, a summit sunrise, a village? Choose the one thing you most want and let it decide between two similar treks.

Not sure? Try the Find my trek guide on the home page, or ask Sunya.`,
      hi: `## 1. आप कब जा सकते हैं?
मौसम सबसे ज़्यादा तय करता है। सर्दी (दिसंबर–फ़रवरी) में केदारकांठा और कुआरी पास जैसे बर्फ़ वाले ट्रेक। जुलाई–अगस्त मानसून है, जब फूलों की घाटी और लद्दाख के वर्षा-छाया वाले ट्रेक सबसे अच्छे होते हैं। वसंत और शरद में ज़्यादातर ऊँचे रास्ते खुलते हैं।

## 2. आपके पास असल में कितने दिन हैं?
यात्रा भी गिनें। ज़्यादातर हिमालयी ट्रेक में दोनों ओर एक-एक पूरा दिन सड़क यात्रा में लगता है। देहरादून से "6 दिन का ट्रेक" दिल्ली से अक्सर 8 दिन का होता है।

## 3. आप कितने फ़िट हैं, ईमानदारी से?
पहले ट्रेक के लिए "आसान" या "आसान–मध्यम" और लगभग 4,000 मी. से कम अधिकतम ऊँचाई वाले रास्ते चुनें। अगर आप 40 मिनट में 5 किमी दौड़ सकते हैं और 30 मिनट सीढ़ियाँ चढ़ सकते हैं, तो शुरुआत के लिए अच्छी स्थिति में हैं।

## 4. आप क्या देखना चाहते हैं?
बर्फ़, बुग्याल, झील, शिखर पर सूर्योदय, गाँव? वह एक चीज़ चुनें जो सबसे ज़्यादा चाहते हैं, और उसे दो मिलते-जुलते ट्रेक में से चुनने दें।

अभी भी तय नहीं? होम पेज पर "मेरा ट्रेक खोजें" आज़माएँ, या शून्य से पूछें।`,
    },
  },
  {
    id: 'fitness-for-trekking', kind: 'guide', languages: ['en', 'hi'], hiReviewed: false,
    title: { en: 'Fitness preparation: an eight-week plan', hi: 'फ़िटनेस की तैयारी: आठ हफ़्ते की योजना' },
    subtitle: { en: 'Endurance first, then strength', hi: 'पहले सहनशक्ति, फिर ताक़त' },
    summary: { en: 'A simple plan you can follow at home: build to 5 km runs, climb stairs with a pack and strengthen your legs and core.', hi: 'घर पर अपनाई जा सकने वाली सरल योजना: 5 किमी दौड़ तक पहुँचें, बैग के साथ सीढ़ियाँ चढ़ें, और पैरों व कोर को मज़बूत करें।' },
    date: '2026-11-20', readTime: 6, relatedTreks: ['hampta-pass', 'everest-base-camp'],
    topics: ['fitness', 'training', 'prepare', 'preparation', 'फ़िटनेस', 'तैयारी', 'exercise'],
    body: {
      en: `## Weeks 1–2: build the habit
Walk or jog 30 minutes, five days a week. Add 10 minutes of squats, lunges and planks.

## Weeks 3–5: build endurance
Work towards 5 km in under 40 minutes (beginner treks) or 10 km (difficult treks). Once a week, climb stairs for 30–45 minutes.

## Weeks 6–8: train like the trail
Carry a 6–8 kg pack on stairs or hills. Do one long walk of 3–4 hours each weekend. Keep strength work twice a week.

## Before you go
Rest for two or three days before the trek. Break in your shoes on these walks, not on the trail.

If you have a heart, lung or blood-pressure condition, or are unsure about your health, see a doctor before starting any plan.`,
      hi: `## हफ़्ते 1–2: आदत बनाएँ
हफ़्ते में पाँच दिन 30 मिनट पैदल चलें या हल्की दौड़ लगाएँ। 10 मिनट स्क्वाट, लंज और प्लैंक जोड़ें।

## हफ़्ते 3–5: सहनशक्ति बढ़ाएँ
आसान ट्रेक के लिए 40 मिनट से कम में 5 किमी, कठिन ट्रेक के लिए 10 किमी का लक्ष्य रखें। हफ़्ते में एक बार 30–45 मिनट सीढ़ियाँ चढ़ें।

## हफ़्ते 6–8: रास्ते जैसा अभ्यास
सीढ़ियों या पहाड़ियों पर 6–8 किलो का बैग लेकर चलें। हर सप्ताहांत 3–4 घंटे की एक लंबी सैर करें। हफ़्ते में दो बार ताक़त वाले व्यायाम जारी रखें।

## जाने से पहले
ट्रेक से पहले दो-तीन दिन आराम करें। जूते इन्हीं सैरों में पहनकर आदत डालें, रास्ते पर नहीं।

अगर आपको दिल, फेफड़े या रक्तचाप की कोई समस्या है, या अपनी सेहत को लेकर संदेह है, तो कोई भी योजना शुरू करने से पहले डॉक्टर से मिलें।`,
    },
  },
  {
    id: 'packing-for-a-himalayan-trek', kind: 'guide', languages: ['en', 'hi'], hiReviewed: false,
    title: { en: 'Packing for a Himalayan trek', hi: 'हिमालयी ट्रेक के लिए सामान' },
    subtitle: { en: 'The right gear, not more gear', hi: 'सही सामान, ज़्यादा सामान नहीं' },
    summary: { en: 'Layers, good shoes, sun protection and a headlamp cover most of it. Here is a list you can adapt.', hi: 'परतें, अच्छे जूते, धूप से बचाव और हेडलैम्प — इसी में ज़्यादातर बात आ जाती है। यह सूची अपने हिसाब से बदलें।' },
    date: '2026-11-20', readTime: 4, relatedTreks: ['kedarkantha', 'valley-of-flowers'],
    topics: ['packing', 'gear', 'pack', 'what to carry', 'clothes', 'सामान', 'कपड़े', 'packing list'],
    body: {
      en: `## Wear and carry
- Trekking shoes with ankle support and good grip, already broken in
- Three warm layers (fleece, light down or synthetic jacket) plus a heavier down jacket for winter or high camps
- Waterproof jacket and pack cover
- Two quick-dry T-shirts, one pair of trek pants, thermal inner layer
- Woollen cap, sun cap, gloves (two pairs in snow), warm socks

## Small things that matter
- Sunglasses (essential on snow), sunscreen and lip balm
- Headlamp with spare batteries
- Two one-litre water bottles and a way to treat water
- Personal medicines, plus anything your doctor advises for altitude
- Toilet kit and a bag to carry your waste back down

## Leave behind
Jeans, cotton layers that stay wet, and anything you would not want to carry for six hours.`,
      hi: `## पहनें और साथ रखें
- टखने को सहारा देने वाले, अच्छी पकड़ वाले ट्रेकिंग जूते, पहले से पहनकर आदत डाले हुए
- तीन गर्म परतें (फ़्लीस, हल्की डाउन या सिंथेटिक जैकेट) और सर्दी या ऊँचे कैंप के लिए भारी डाउन जैकेट
- वाटरप्रूफ़ जैकेट और बैग कवर
- जल्दी सूखने वाली दो टी-शर्ट, एक ट्रेक पैंट, थर्मल इनर
- ऊनी टोपी, धूप की टोपी, दस्ताने (बर्फ़ में दो जोड़ी), गर्म मोज़े

## छोटी पर ज़रूरी चीज़ें
- धूप का चश्मा (बर्फ़ पर अनिवार्य), सनस्क्रीन और लिप बाम
- अतिरिक्त बैटरी के साथ हेडलैम्प
- एक-एक लीटर की दो पानी की बोतलें और पानी शुद्ध करने का साधन
- निजी दवाइयाँ, और ऊँचाई के लिए जो डॉक्टर सलाह दें
- शौच की किट और अपना कचरा वापस लाने के लिए थैला

## न ले जाएँ
जींस, गीले रहने वाले सूती कपड़े, और ऐसा कुछ भी जिसे आप छह घंटे उठाना न चाहें।`,
    },
  },
  {
    id: 'altitude-awareness', kind: 'guide', safety: true, languages: ['en', 'hi'], hiReviewed: false,
    title: { en: 'Altitude awareness for trekkers', hi: 'ट्रेकर्स के लिए ऊँचाई की समझ' },
    subtitle: { en: 'What to watch for, and the one rule that matters', hi: 'किन बातों पर ध्यान दें, और एक नियम जो सबसे अहम है' },
    summary: { en: 'Altitude sickness can affect anyone above about 2,500 m, whatever their fitness. Learn the early signs and never go higher with symptoms.', hi: 'लगभग 2,500 मी. से ऊपर ऊँचाई की बीमारी किसी को भी हो सकती है, फ़िटनेस चाहे जैसी हो। शुरुआती लक्षण पहचानें और लक्षणों के साथ कभी ऊपर न जाएँ।' },
    date: '2026-11-20', readTime: 5, relatedTreks: ['everest-base-camp', 'roopkund', 'markha-valley'],
    topics: ['altitude', 'ams', 'altitude sickness', 'acclimatisation', 'acclimatization', 'headache', 'ऊँचाई', 'बीमारी', 'oxygen'],
    body: {
      en: `This is general awareness, not medical advice. Speak to a doctor before a high-altitude trek, especially if you have a health condition or are considering medication.

## Why it happens
Air pressure falls as you climb, so each breath carries less oxygen. The body adjusts over days, not hours. Fitness does not protect you; ascent rate does.

## Early signs to take seriously
Headache, nausea or loss of appetite, unusual tiredness, dizziness, and poor sleep after gaining height.

## The rule
Do not go higher with symptoms. Rest at the same altitude. If symptoms get worse, go down.

## Warning signs — descend now and get help
Confusion, stumbling or loss of coordination, breathlessness while resting, a wet cough, or extreme drowsiness. These can become life-threatening quickly. Do not wait for morning if you can descend safely with help.

## Habits that help
- Above about 3,000 m, increase sleeping altitude gradually and include rest days
- "Climb high, sleep low" on acclimatisation days
- Drink enough water, avoid alcohol, and tell your guide honestly how you feel`,
      hi: `यह सामान्य जानकारी है, चिकित्सा सलाह नहीं। ऊँचाई वाले ट्रेक से पहले डॉक्टर से बात करें, ख़ासकर अगर आपको कोई स्वास्थ्य समस्या है या आप कोई दवा लेने की सोच रहे हैं।

## ऐसा क्यों होता है
ऊपर जाने पर हवा का दबाव घटता है, इसलिए हर साँस में कम ऑक्सीजन मिलती है। शरीर घंटों में नहीं, दिनों में ढलता है। फ़िटनेस आपको नहीं बचाती; चढ़ाई की गति बचाती है।

## शुरुआती लक्षण जिन्हें गंभीरता से लें
सिरदर्द, जी मिचलाना या भूख न लगना, असामान्य थकान, चक्कर, और ऊँचाई बढ़ने के बाद नींद ठीक न आना।

## नियम
लक्षणों के साथ ऊपर न जाएँ। उसी ऊँचाई पर आराम करें। लक्षण बढ़ें तो नीचे उतरें।

## ख़तरे के संकेत — तुरंत नीचे उतरें और मदद लें
भ्रम, लड़खड़ाना या संतुलन खोना, आराम करते हुए भी साँस फूलना, गीली खाँसी, या बहुत ज़्यादा उनींदापन। ये जल्दी जानलेवा हो सकते हैं। अगर मदद के साथ सुरक्षित रूप से उतर सकते हैं, तो सुबह का इंतज़ार न करें।

## मददगार आदतें
- लगभग 3,000 मी. से ऊपर, सोने की ऊँचाई धीरे-धीरे बढ़ाएँ और विश्राम दिवस रखें
- अनुकूलन के दिनों में "ऊपर चढ़ें, नीचे सोएँ"
- पर्याप्त पानी पिएँ, शराब से बचें, और गाइड को ईमानदारी से बताएँ कि आप कैसा महसूस कर रहे हैं`,
    },
  },
  {
    id: 'responsible-trekking', kind: 'guide', languages: ['en', 'hi'], hiReviewed: false,
    title: { en: 'Responsible trekking', hi: 'ज़िम्मेदार ट्रेकिंग' },
    subtitle: { en: 'Leave the mountain as quiet as you found it', hi: 'पहाड़ को उतना ही शांत छोड़ें जितना पाया था' },
    summary: { en: 'Carry your waste down, respect village customs and sacred sites, and keep noise low. Small habits, repeated by thousands of trekkers.', hi: 'अपना कचरा नीचे लाएँ, गाँव की परंपराओं और पवित्र स्थलों का सम्मान करें, और शोर कम रखें। छोटी आदतें, जिन्हें हज़ारों ट्रेकर दोहराते हैं।' },
    date: '2026-11-20', readTime: 3, relatedTreks: ['triund', 'kheerganga', 'chandrakhani-pass'],
    topics: ['responsible', 'waste', 'leave no trace', 'environment', 'कचरा', 'ज़िम्मेदार'],
    body: {
      en: `## Carry it down
Everything you bring up, including wrappers and tissue, comes back down with you. Keep a small bag for it in your pack.

## Respect places and people
Ask before photographing people. Follow local customs at temples, gompas and in villages — some, like Malana, have strict rules about touching. Dress modestly in villages.

## Keep it quiet
No speakers on the trail or at camp. Silence is part of what everyone came for.

## Stay on the trail
Shortcuts erode slopes and damage meadows that take decades to recover. Camp only where it is permitted.`,
      hi: `## नीचे लाएँ
जो कुछ भी आप ऊपर ले जाते हैं, रैपर और टिशू सहित, आपके साथ नीचे आता है। इसके लिए बैग में एक छोटा थैला रखें।

## जगहों और लोगों का सम्मान
लोगों की फ़ोटो लेने से पहले पूछें। मंदिरों, गोम्पाओं और गाँवों में स्थानीय परंपराओं का पालन करें — कुछ जगहों पर, जैसे मलाणा में, छूने को लेकर सख़्त नियम हैं। गाँवों में शालीन कपड़े पहनें।

## शांति बनाए रखें
रास्ते पर या कैंप में स्पीकर न चलाएँ। मौन ही वह चीज़ है जिसके लिए सब आए हैं।

## रास्ते पर रहें
शॉर्टकट से ढलानें कटती हैं और बुग्याल नष्ट होते हैं, जिन्हें ठीक होने में दशकों लगते हैं। केवल अनुमति वाली जगह पर ही कैंप करें।`,
    },
  },
  {
    id: 'seasonal-planning', kind: 'guide', languages: ['en', 'hi'], hiReviewed: false,
    title: { en: 'Planning by season', hi: 'मौसम के अनुसार योजना' },
    subtitle: { en: 'Which months suit which mountains', hi: 'कौन-से महीने किन पहाड़ों के लिए' },
    summary: { en: 'Winter snow treks, spring rhododendrons, monsoon rain-shadow routes and clear autumn skies — a month-by-month way to think about it.', hi: 'सर्दियों के बर्फ़ीले ट्रेक, वसंत के बुरांश, मानसून के वर्षा-छाया वाले रास्ते और शरद के साफ़ आसमान — महीने दर महीने सोचने का तरीक़ा।' },
    date: '2026-11-20', readTime: 4, relatedTreks: ['kedarkantha', 'valley-of-flowers', 'markha-valley', 'goechala'],
    topics: ['season', 'month', 'when', 'best time', 'weather', 'monsoon', 'winter', 'मौसम', 'महीना', 'कब'],
    body: {
      en: `## December–February: winter
Snow treks at moderate altitude in Uttarakhand (Kedarkantha, Brahmatal, Kuari Pass, Dayara Bugyal). Very cold nights. High passes are closed. In the south, the Western Ghats are at their best.

## March–May: spring
Rhododendrons in the forests, most Nepal routes in season, Sikkim's Goechala and Sandakphu. Early-season snow lingers on passes.

## June–August: summer and monsoon
Heavy rain on the southern Himalaya brings landslide risk on roads. Go to rain-shadow areas instead: Ladakh, Lahaul, Spiti, Upper Mustang — or choose Valley of Flowers for the bloom, prepared for rain.

## September–November: autumn
Clear skies after the monsoon. The best window for many high-altitude treks in India and Nepal, including Everest Base Camp.

Weather changes year to year. Always check current forecasts and road status before you travel.`,
      hi: `## दिसंबर–फ़रवरी: सर्दी
उत्तराखंड में मध्यम ऊँचाई के बर्फ़ीले ट्रेक (केदारकांठा, ब्रह्मताल, कुआरी पास, दयारा बुग्याल)। रातें बहुत ठंडी। ऊँचे दर्रे बंद। दक्षिण में पश्चिमी घाट अपने सबसे अच्छे रूप में।

## मार्च–मई: वसंत
जंगलों में बुरांश, नेपाल के ज़्यादातर रास्तों का मौसम, सिक्किम का गोएचा ला और संदकफू। दर्रों पर शुरुआती मौसम की बर्फ़ बनी रहती है।

## जून–अगस्त: गर्मी और मानसून
दक्षिणी हिमालय में भारी बारिश से सड़कों पर भूस्खलन का ख़तरा। इसके बजाय वर्षा-छाया वाले क्षेत्रों में जाएँ: लद्दाख, लाहौल, स्पीति, अपर मुस्तांग — या बारिश के लिए तैयार होकर फूलों की घाटी चुनें।

## सितंबर–नवंबर: शरद
मानसून के बाद साफ़ आसमान। भारत और नेपाल के कई ऊँचे ट्रेक के लिए सबसे अच्छा समय, एवरेस्ट बेस कैंप सहित।

मौसम हर साल बदलता है। यात्रा से पहले हमेशा वर्तमान पूर्वानुमान और सड़क की स्थिति जाँचें।`,
    },
  },
];

export const articles = [...guides, ...reflections].sort((a, b) => b.date.localeCompare(a.date));
export const getArticle = id => articles.find(a => a.id === id) || null;
