import React from 'react';
import { useLang } from '../i18n';

/*
  Atmospheric placeholder art for treks without owner photography.
  Colour comes from the dominant landscape; the ridge line is generated
  from the trek id so each card is distinct but calm.
  To use a real photo, add `"image": { "src": "...", "alt": { "en": "..." } }`
  to the trek record; TrekVisual then renders it instead.
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

export default function TrekVisual({ trek, tall = false, className = '' }) {
  const { tx } = useLang();
  if (trek.image?.src) {
    return (
      <div className={`trek-visual ${tall ? 'trek-visual--tall' : ''} ${className}`}>
        <img src={trek.image.src} alt={tx(trek.image.alt)} loading="lazy" />
      </div>
    );
  }
  const key = trek.landscapes.find(l => PALETTES[l]) || 'summit';
  const [dark, mid, light] = PALETTES[key];
  const seed = hash(trek.id);
  return (
    <div className={`trek-visual ${tall ? 'trek-visual--tall' : ''} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMax slice" role="presentation">
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
    </div>
  );
}
