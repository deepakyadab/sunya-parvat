# Sunya Parvat — शून्य पर्वत

A calm, bilingual (English / हिंदी) guide for finding, comparing and preparing for treks.
React 18 + Create React App, deployed on Vercel as static files plus one serverless
function (`api/enquiry.js`) that emails contact and trek enquiries.

```
npm install
npm start              # http://localhost:3000  (also enables /editor)
npm run build          # production build + static pre-render + sitemap
npm run check-data     # validate the trek catalog and photo licensing (--verbose for warnings)
npm run editor-server  # local-only server that lets /editor write trek files
npm run api            # local enquiry API (see "Contact and trek enquiries")
npm run test:enquiry   # tests for the enquiry handler (no email is sent)
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
- The Connect form showed "Received" but sent nothing. It now sends through a server-side
  email function (see "Contact and trek enquiries").
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
- **Photography.** 70 of 71 treks have a licensed Wikimedia Commons photo (see "Trek
  photos"). Warwan Valley still shows a placeholder. Owner photos would be better still;
  replace an `image` block whenever you have your own.
- **Merged entry.** "Singalila Ridge" is merged into Sandakphu–Phalut (same ridge).
  Zanskar, from the live site, is not in this catalog yet.
- **Email delivery.** Needs a Resend account and environment variables before it works in
  production. Real inbox delivery to sunyaparvat@gmail.com has not been tested yet
  (see "Contact and trek enquiries").

## Trek photos

Each trek's `image` block records where its photo comes from:

```json
"image": {
  "src": "…/960px-File.jpg", "srcSmall": "…/500px-File.jpg", "srcLarge": "…/1280px-File.jpg",
  "width": 960, "height": 640,
  "scope": "route",
  "alt": { "en": "…", "hi": "…" },
  "subject": { "en": "…" },
  "author": "Photographer", "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:…",
  "source": "Wikimedia Commons", "retrieved": "2026-11-24"
}
```

- **Source.** All current photos are from Wikimedia Commons under CC0, public domain,
  CC BY or CC BY-SA. NC, ND and GFDL-only files are rejected by `npm run check-data`.
  Each was chosen because its Commons title or description names the trek or a place on
  it, and each was checked by eye before its alt text was written.
- **`scope`.** `route` means the photo shows the trek or a point on it. `regional` means
  the right region but not the exact route; the card and page say so. Sham Valley is the
  only regional photo (apricot blossom at Alchi).
- **Credit.** Every trek page shows photographer, license link and source under the hero,
  and `/credits` lists them all. CC BY and CC BY-SA require this attribution, so keep it
  if you change the layout.
- **No photo.** If no `image` is set, a clean generated placeholder marked "Photo coming
  soon" is shown (currently Warwan Valley).
- **Speed.** Wikimedia's standard 500/960/1280 px renditions are served with
  `srcset`/`sizes`. Cards lazy-load; the trek hero loads first.
- **Owner photos.** Put files in `public/images/treks/`, set `src` to `/images/treks/x.jpg`,
  `author` to the photographer, `license` to "Owner photo — all rights reserved" (or your
  chosen license), and `sourceUrl` to your site or Instagram post.

## Contact and trek enquiries

The Connect page form and the "Have a question about this trek?" form on every trek page
post to `/api/enquiry`. That is a Vercel serverless function (`api/enquiry.js`) which
sends the enquiry with [Resend](https://resend.com) to the address in `ENQUIRY_TO`.

- **Fields:** name, reply email, the selected trek (optional on Connect, fixed on trek
  pages) and the message. Nothing else is collected or stored.
- **Validation:** checked in the browser and again on the server: name 2–80 characters,
  valid email, message 10–2,000 characters, and a known trek id format.
- **Spam protection:** a hidden honeypot field, a minimum time to fill the form, a limit
  on links in the message, and an origin check.
- **Rate limiting:** 5 messages per IP address per 10 minutes. This is kept in memory per
  serverless instance, so it is best-effort; use Upstash or Vercel KV for a strict limit.
- **Honest status:** the success message appears only after Resend accepts the email. On
  any failure the visitor sees a retry message, their entries stay in the form, and no
  provider or configuration details are shown.
- **Acknowledgement:** with `ENQUIRY_SEND_ACK=true`, the visitor gets a short "we received
  your message" email in their language. This needs a verified sending domain.

### Set it up on Vercel

1. Create a Resend account. Verify a domain you own, or for a first test use the sender
   `onboarding@resend.dev`, which only delivers to the email address that owns the Resend
   account.
2. In Vercel → Project → Settings → Environment Variables, add the variables from
   `.env.example`: `RESEND_API_KEY`, `ENQUIRY_TO=sunyaparvat@gmail.com`, `ENQUIRY_FROM`,
   `ENQUIRY_SEND_ACK` and `SITE_URL`. Never commit real values; they are server-only and
   never reach the browser bundle.
3. Redeploy, send a test message from `/connect`, and confirm it arrives in the
   sunyaparvat@gmail.com inbox. Check the spam folder the first time.

### Develop and test locally

```
cp .env.example .env.local   # then set EMAIL_PROVIDER=mock to avoid sending real email
npm run api                  # enquiry API on :4322 (npm start proxies /api to it)
npm start
npm run test:enquiry         # 13 handler tests: delivery, validation, spam, rate limit, failures
```

`EMAIL_PROVIDER=mock` prints the email in the API terminal, and `mock-fail` simulates a
provider error. Both are refused in production.
