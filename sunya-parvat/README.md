# Sunya Parvat — शून्य पर्वत

A calm, bilingual (English / हिंदी) guide for finding, comparing and preparing for treks.
React 18 + Create React App, no backend. Deployed as static files (Vercel).

```
npm install
npm start              # http://localhost:3000  (also enables /editor)
npm run build          # production build + static pre-render + sitemap
npm run check-data     # validate the trek catalog (add --verbose for warnings)
npm run editor-server  # local-only server that lets /editor write trek files
```

## What is on the site

| Route | Purpose |
| --- | --- |
| `/` | Hero with **Find your trek**, the 3-question trek guide, seasons, featured treks, journal |
| `/treks` | Searchable directory: country, region, trip length, month, season, difficulty, experience, landscape; chips, clear-all, sorting, saved shortlist. Filters live in the URL, so a filtered view can be shared |
| `/treks/:id` | Consistent trek page: overview, quick facts, best time, itinerary, getting there, fitness, gear, permits, stay, FAQs, reading, similar treks, enquiry |
| `/compare?ids=a,b,c` | Side-by-side table (stacked rows on phones). Unknown values show **Not verified** |
| `/journal`, `/journal/:id` | Guides and reflections; each shows the languages it exists in |
| `/ask` (+ floating button) | **Ask Sunya**, answers only from trek records and articles |
| `/about`, `/before-you-go`, `/connect` | Existing brand pages, kept |

Old URLs (`/journeys/...`, `/stories/...`) redirect to their new pages.

## Trek data

Every `*.json` file in `src/data/treks/` is loaded automatically. A file can hold one trek
or an array. Add a route by adding an object; the UI needs no changes. Vocabulary
(regions, difficulty levels, landscapes, experience types, day kinds) lives in
`src/data/taxonomy.js`.

Rules the data follows:

- **Facts vs editorial.** Facts (`totalDays`, `walkingDays`, `maxAltitudeM`, `months`,
  `bestMonths`, `permits`, `guide` …) describe the route. Editorial fields (`editorial.label`
  with a `reason`, `tagline`, day `reflection`) are Sunya Parvat's voice. Labels such as
  "Classic" or "Quieter route" are only used with a stated reason. There are no ratings,
  visitor counts or "unexplored" claims.
- **Unknown means `null`.** The site then shows "Not verified" rather than a guess.
- **Seasons are derived from `months`**, so cards, filters, detail pages and Ask Sunya
  can't disagree. This fixes the old site's inconsistent Everest Base Camp seasons
  ("Spring/Autumn" in one place, "March–November" in another).
- **`durationNote`** states whether the advertised days include travel and buffer days.
- **`verification`** = `{ status, checkedOn, sources[], localCheck }`. Every trek starts as
  `unverified`. `localCheck` shows a visible warning (court orders, closures, restricted
  permits). `specialPermit: true` flags restricted-area or capped permits.
- Each itinerary day supports `kind` (travel / trek / summit / acclimatisation / buffer /
  rest), `route`, `description`, `distanceKm`, `ascentM`, `descentM`, `hours`,
  `altitudeM`, `overnight`, `meals`, `notes` and an optional English `reflection`.

Expand the catalog in verified batches: add the treks, run `npm run check-data`, then
set `verification.status: "verified"` with a `checkedOn` date and `sources` only after
someone has actually checked them.

## Itinerary editor (owner only)

`/editor` exists **only in development builds**. `npm run build` leaves it out (checked:
the production bundle contains no editor code). To use it:

1. `npm run editor-server` in one terminal (listens on `127.0.0.1:4321`, accepts requests
   only from `localhost:3000`).
2. `npm start` in another, then open `http://localhost:3000/editor`.
3. Create or edit a trek, add, reorder and delete days, fill English and Hindi fields, then:
   **Save draft** (kept in this browser only), **Preview** (renders the real trek page in
   either language), and **Write as draft** or **Publish** (writes the JSON file).
4. Review the change with `git diff`, commit and push. Vercel redeploys.

Access control here is "it only runs on the owner's machine". There is no login. If other
editors need to edit from the web, the smallest next step is a Git-based CMS such as
Decap CMS with GitHub sign-in, pointed at `src/data/treks/`. That needs a GitHub OAuth app
and is not set up yet.

## Ask Sunya

`src/lib/askSunya.js` is a deterministic, retrieval-only assistant. It uses no AI model and
makes no network calls. It recognises trek names (English, Hindi and aliases), months,
trip length, experience and landscape, and:

- answers itinerary, best-time, permit, getting-there, gear and difficulty questions from
  the trek record, with a link to the page;
- compares two treks and links to `/compare`;
- suggests up to three treks, or asks a short follow-up if it doesn't have enough to go on;
- points to journal articles for preparation topics;
- says plainly when a trek isn't on the site, declines medical, live-weather and
  booking/price questions, and gives 112 for emergencies in India;
- replies in Hindi when the question is written in Devanagari.

## Language

The `EN / हिं` switch is remembered per browser (`?lang=hi` also works). UI strings are in
`src/i18n/strings.js`. Trek and article fields are `{ en, hi }`. When Hindi is missing, the
English text is shown with an "English" tag instead of a machine translation.

## SEO

`usePageMeta` sets title, description and canonical per page. After the build,
`scripts/prerender.js` writes a static HTML file for each public route (91 routes), with
its own title, description and a plain-HTML summary. It also writes `sitemap.xml` and
`robots.txt`. Set `SITE_URL` if the domain changes.

## Audit findings (November 2026) and what changed

- **Repo ≠ live site.** `sunya-parvat.vercel.app` currently serves a different app (a Google
  AI Studio/Vite build with `/treks`, Zanskar and Everest Base Camp). This work is on
  this repository. Point the Vercel project at it (root directory `sunya-parvat`) to ship it.
- `node_modules` was committed to the repository. It is now ignored.
- Tailwind v4 was configured but unused, and its CRA/PostCSS setup was broken. Removed.
- The Connect form showed "Received" but sent nothing. It now opens the visitor's email
  app with the message filled in, and says so.
- Fixed content errors in the old data:
  - Valley of Flowers was listed under spring (the park opens 1 June), so the spring
    filter showed nothing.
  - Hampta Pass "ends on the Spiti River". Chatru is on the Chandra.
  - Brahmatal's 3,862 m conflicts with the commonly cited ~3,734 m; this is now flagged
    in the trek data.
- The live site's footer links (`#` Journal, Instagram, Newsletter, Privacy, Terms) and its
  "Limited slots" claim do not appear in this codebase. Every link here goes to a real page.
- Contrast: muted text raised to meet WCAG AA. Added keyboard focus styles, a skip link,
  reduced-motion support and labelled controls.

## Needs an owner or local expert

- **All 71 treks are `unverified`.** Facts came from general knowledge and must be checked
  against official or local sources before being marked verified. Priorities:
  - Roopkund and Ali–Bedni: bugyal camping orders and current access.
  - Nepal's licensed-guide rule in Khumbu, and how it applies to Indian citizens.
  - Chadar, Kheerganga, Chembra and Triund: current camping or opening rules.
  - Gaumukh daily cap, Inca Trail permits, Bhutan's Sustainable Development Fee.
- **Unknown values to fill in:** Warwan Valley (start, altitude), Lamayuru–Alchi,
  Upper Mustang, Jomolhari, Druk Path and Laugavegur heights, plus several distances.
- **Hindi review.** All Hindi copy was written by hand for this site, not machine-translated,
  but a fluent Hindi editor must review it before launch. Safety content comes first:
  `altitude-awareness`, trek `localCheck` notes, Ask Sunya's safety replies. Articles carry
  `hiReviewed: false` until then.
- **Photography.** Cards use generated mountain artwork. Add real photos per trek with
  `"image": { "src", "alt": { "en", "hi" } }`. The home hero uses one Unsplash photo
  shown as decoration (empty alt), not as a specific trek.
- **Merged entry.** "Singalila Ridge" is merged into Sandakphu–Phalut (same ridge).
  Zanskar, from the live site, is not in this catalog yet.
- **Contact.** The site uses `sunyaparvat@gmail.com`, taken from the live site's footer.
  Confirm it, or connect a form service (for example Formspree) to receive messages on-site.
