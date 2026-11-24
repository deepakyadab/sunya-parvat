/*
  Trek catalog loader.

  Every *.json file in this folder is loaded automatically. A file may hold
  one trek object or an array of treks, so you can add a single new route as
  `my-trek.json` or extend a regional file — no UI code needs to change.

  Field guide (see README "Trek data" for the full list):
  - Facts (totalDays, maxAltitudeM, months, permits …) are what the route IS.
    Use null when a value is unknown; the site shows "Not verified" instead of guessing.
  - Editorial fields (editorial.label, tagline, reflection) are Sunya Parvat's opinion.
  - verification.status / checkedOn / sources record when safety-sensitive facts
    were last confirmed. Everything starts as "unverified".
*/
import { buildCatalog, normalise } from './build';

const ctx = require.context('./', false, /\.json$/);
const catalog = buildCatalog(ctx.keys().map(key => [key.replace('./', ''), ctx(key)]));

export const allTreks = catalog.allTreks;
export const treks = catalog.treks;
export const getTrek = catalog.getTrek;
export const isLegacyId = catalog.isLegacyId;

export { normalise };