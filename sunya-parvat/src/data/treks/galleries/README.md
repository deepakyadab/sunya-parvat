# Trek photo galleries

One file per trek: `<trek-id>.json`, an array of photos. Each photo uses the same
fields as a trek's `image` block (see the main README, "Trek photos"):

```json
{
  "src": ".../960px-File.jpg", "srcSmall": ".../500px-File.jpg", "srcLarge": ".../1280px-File.jpg",
  "width": 960, "height": 640,
  "scope": "route",
  "alt": { "en": "Describe what is in the photo" },
  "author": "Photographer", "license": "CC BY-SA 4.0", "licenseUrl": "https://...",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:...", "source": "Wikimedia Commons",
  "retrieved": "2026-11-25"
}
```

Rules (checked by `npm run check-data`):

- Only photos of this route, or a clearly relevant regional photo with `"scope": "regional"`.
- No AI-generated, competitor or unrelated images, and no repeats of the hero image.
- Licence must allow reuse with attribution (CC BY, CC BY-SA, CC0, public domain). No NC, ND or GFDL-only.
- Fewer photos are better than misleading ones. A trek with no file shows no gallery.

Files here are loaded only when that trek's page opens.
