import React from 'react';
import { useLang } from '../i18n';

/*
  Trek photo, or a clean generated placeholder when no rights-cleared photo exists yet.

  Photo data lives on the trek record (see README "Trek photos"):
  "image": {
    "src": ".../960px-File.jpg",      960px rendition (detail pages)
    "srcSmall": ".../500px-File.jpg", 500px rendition (cards)
    "srcLarge": ".../1280px-File.jpg",optional, wide screens
    "width": 960, "height": 640,
    "scope": "route" | "regional",    regional = right region, not the exact route
    "alt": { "en": "...", "hi": "..." },
    "author": "...", "license": "CC BY-SA 4.0", "licenseUrl": "...", "sourceUrl": "..."
  }
*/
const PALETTES = {
  glacier: ['#0d1520', '#1b2a3d', '#c8d8e8'],
  summit: ['#0d1520', '#1d2633', '#d9d4c7'],
  pass: ['#121218', '#24252e', '#cfc9bc'],
  lake: ['#0a1416', '#15292c', '#9fc2c4'],
  meadow: ['#0d1a0d', '#1d2e1b', '#b8c79a'],
  forest: ['#0a120c', '#18261a', '#8fa889'],
  ridge: ['#14110c', '#2a241a', '#d1b98d'],
  valley: ['#0d1418', '#1b2830', '#a9b8bf'],
  desert: ['#1a1208', '#33261a', '#d9b98a'],
  village: ['#16120c', '#2b2318', '#c9a96e'],
};

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function ridge(seed, base, amp, points = 9) {
  let h = seed;
  const pts = [];
  for (let i = 0; i <= points; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const y = base - ((h % 1000) / 1000) * amp;
    pts.push(`${(i * 400) / points},${y.toFixed(1)}`);
  }
  return `M0,250 L${pts.join(' L')} L400,250 Z`;
}

export function hasPhoto(trek) {
  return !!(trek.image && trek.image.src && trek.image.license && trek.image.sourceUrl);
}

export default function TrekVisual({ trek, tall = false, className = '', priority = false, showScope = true }) {
  const { t, tx } = useLang();
  const cls = `trek-visual ${tall ? 'trek-visual--tall' : ''} ${className}`;

  if (hasPhoto(trek)) {
    const img = trek.image;
    const srcSet = [
      img.srcSmall && `${img.srcSmall} 500w`,
      `${img.src} 960w`,
      img.srcLarge && `${img.srcLarge} 1280w`,
    ].filter(Boolean).join(', ');
    // Large views paint the small rendition (usually cached from the cards) underneath,
    // so the hero is never an empty dark box while the big file downloads.
    const backdrop = tall && img.srcSmall ? { backgroundImage: `url("${img.srcSmall}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined;
    return (
      <div className={cls} style={backdrop}>
        <img
          src={tall ? img.src : img.srcSmall || img.src}
          srcSet={srcSet}
          sizes={tall ? '100vw' : '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px'}
          width={img.width || 960}
          height={img.height || 640}
          alt={tx(img.alt)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchpriority: 'high' } : {})}
        />
        {showScope && img.scope === 'regional' && <span className="trek-visual__scope">{t('photo.regional')}</span>}
      </div>
    );
  }

  const key = trek.landscapes.find(l => PALETTES[l]) || 'summit';
  const [dark, mid, light] = PALETTES[key];
  const seed = hash(trek.id);
  return (
    <div className={`${cls} trek-visual--placeholder`}>
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`sky-${trek.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dark} />
            <stop offset="100%" stopColor={mid} />
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill={`url(#sky-${trek.id})`} />
        <path d={ridge(seed, 120, 70, 7)} fill={light} opacity="0.18" />
        <path d={ridge(seed * 7 + 3, 170, 60, 9)} fill={light} opacity="0.1" />
        <path d={ridge(seed * 13 + 5, 215, 40, 11)} fill="#0a0a08" opacity="0.65" />
      </svg>
      {showScope && <span className="trek-visual__scope trek-visual__scope--quiet">{t('photo.placeholder')}</span>}
    </div>
  );
}

/* Credit line required by the photo's license. */
export function PhotoCredit({ trek }) {
  const { t, tx } = useLang();
  if (!hasPhoto(trek)) return null;
  const img = trek.image;
  return (
    <p className="photo-credit">
      {img.scope === 'regional' && <span className="photo-credit__scope">{t('photo.regional')}{img.subject ? `: ${tx(img.subject)}` : ''}. </span>}
      {img.scope !== 'regional' && img.subject && <span>{tx(img.subject)}. </span>}
      {t('photo.credit')}: <a href={img.sourceUrl} target="_blank" rel="noreferrer">{img.author || 'Wikimedia Commons'}</a>
      {' · '}
      {img.licenseUrl ? <a href={img.licenseUrl} target="_blank" rel="noreferrer license">{img.license}</a> : img.license}
    </p>
  );
}
