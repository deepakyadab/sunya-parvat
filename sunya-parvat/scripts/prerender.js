/*
  Post-build step: writes a static HTML file for every public route with its
  own <title>, description, canonical URL and a plain-HTML summary inside
  #root. Search engines and link previews can read trek and article pages
  without running JavaScript; React replaces the summary when it loads.
  Also writes sitemap.xml and robots.txt.
*/
const fs = require('fs');
const path = require('path');
const { ROOT, loadTreks, importEsm } = require('./lib');

const SITE = process.env.SITE_URL || 'https://sunya-parvat.vercel.app';
const BUILD = path.join(ROOT, 'build');

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(template, { route, title, description, body }) {
  const full = `${title} · Sunya Parvat`;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(full)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`);
  const head = [
    `<link rel="canonical" href="${SITE}${route}" />`,
    `<meta property="og:title" content="${esc(full)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${SITE}${route}" />`,
    `<meta property="og:type" content="website" />`,
  ].join('');
  html = html.replace('</head>', `${head}</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root"><main class="prerender">${body}</main></div>`);
  return html;
}

function write(route, html) {
  const dir = path.join(BUILD, route === '/' ? '' : route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

(async () => {
  const template = fs.readFileSync(path.join(BUILD, 'index.html'), 'utf8');
  const { articles } = await importEsm('src/data/journal.js');
  const { regions } = await importEsm('src/data/taxonomy.js');
  const treks = loadTreks().filter(t => (t.status || 'published') === 'published');
  const routes = [];

  const add = (route, meta) => { write(route, page(template, { route, ...meta })); routes.push(route); };

  add('/', {
    title: 'Find your Himalayan trek',
    description: `A calm guide to ${treks.length} treks in India, Nepal and beyond: find the right trek for your month, days and experience, compare routes and prepare well.`,
    body: `<h1>Sunya Parvat — Into the mountains. Into the self.</h1><p><a href="/treks">Find a trek</a> · <a href="/compare">Compare treks</a> · <a href="/journal">Journal</a> · <a href="/ask">Ask Sunya</a></p>`,
  });

  add('/treks', {
    title: 'Find a trek',
    description: `Search and filter ${treks.length} treks by country, region, duration, month, difficulty and landscape.`,
    body: `<h1>Find a trek</h1><ul>${treks.map(t => `<li><a href="/treks/${t.id}">${esc(t.name.en)}</a> — ${esc(regions[t.region] ? regions[t.region].en : t.region)}, ${t.totalDays || '?'} days</li>`).join('')}</ul>`,
  });

  treks.forEach(t => {
    const best = (t.bestMonths || t.months || []).map(m => monthNames[m - 1]).join(', ');
    const facts = [t.totalDays && `${t.totalDays} days`, t.maxAltitudeM && `highest point ${t.maxAltitudeM} m`, t.difficulty, best && `best ${best}`].filter(Boolean).join(' · ');
    const itin = (t.itinerary || []).map(d => `<li>Day ${d.day}: ${esc(d.route && d.route.en)}</li>`).join('');
    add(`/treks/${t.id}`, {
      title: `${t.name.en} trek — itinerary, best time & facts`,
      description: `${(t.highlight && t.highlight.en) || ''} ${facts}.`.trim(),
      body: `<h1>${esc(t.name.en)}</h1><p>${esc((t.overview && t.overview.en) || (t.highlight && t.highlight.en))}</p><p>${esc(facts)}</p>${itin ? `<h2>Itinerary</h2><ol>${itin}</ol>` : ''}`,
    });
  });

  add('/compare', { title: 'Compare treks', description: 'Compare two or three treks side by side: days, altitude, difficulty, months, permits and who each suits.', body: '<h1>Compare treks</h1>' });
  add('/journal', {
    title: 'Journal',
    description: 'Guides and reflections in English and Hindi: choosing a first trek, fitness, packing, altitude awareness and seasons.',
    body: `<h1>Journal</h1><ul>${articles.map(a => `<li><a href="/journal/${a.id}">${esc(a.title.en || a.title.hi)}</a></li>`).join('')}</ul>`,
  });
  articles.forEach(a => {
    const l = a.languages[0];
    add(`/journal/${a.id}`, {
      title: a.title[l],
      description: a.summary[l],
      body: `<article lang="${l}"><h1>${esc(a.title[l])}</h1>${String(a.body[l]).split(/\n\s*\n/).map(p => `<p>${esc(p.replace(/^## /, ''))}</p>`).join('')}</article>`,
    });
  });
  add('/ask', { title: 'Ask Sunya', description: 'Ask questions about treks on this site in English or Hindi.', body: '<h1>Ask Sunya</h1>' });
  add('/about', { title: 'About', description: 'Why Sunya Parvat exists.', body: '<h1>About Sunya Parvat</h1>' });
  add('/before-you-go', { title: 'Before You Go', description: 'What the mountain asks of you: fitness, mindset, discipline and gear.', body: '<h1>Before You Go</h1>' });
  add('/connect', { title: 'Connect', description: 'Write to Sunya Parvat with a question about a trek.', body: '<h1>Connect</h1>' });

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(BUILD, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r => `  <url><loc>${SITE}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(BUILD, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /editor\nSitemap: ${SITE}/sitemap.xml\n`);

  console.log(`Prerendered ${routes.length} routes, sitemap.xml and robots.txt.`);
})().catch(e => { console.error(e); process.exit(1); });
