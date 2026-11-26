import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n';
import { getTrek } from '../../data/treks';
import './SeasonScroll.css';

/*
  Seasons as a scroll story.

  Direction: adapted from section one of "Five scroll-based sections" on Prompt Motion
  (prompt-motion.com/ercankeskinx-ec2568): an editorial list where the item being read
  lights up while a pinned photo beside it changes.

  Wide screens: list on the left, pinned photo on the right that crossfades to a real
  trek from that season. Phones: no pinning; each season shows its own photo inline.
  Reduced motion: same layout, changes happen instantly (see the CSS).
  The photos are the treks' own credited images; nothing is decorative stock.
*/

// One representative trek per season, chosen because the season is in its best months
// and its photo shows that season's character.
const SEASON_TREK = { winter: 'brahmatal', spring: 'har-ki-dun', monsoon: 'valley-of-flowers', autumn: 'annapurna-base-camp' };

function Photo({ trek, active, priority = false }) {
  const { t, tx } = useLang();
  const img = trek && trek.image;
  if (!img) return null;
  return (
    <figure className={`season-photo${active ? ' is-active' : ''}`} aria-hidden={!active}>
      <img
        src={img.src}
        srcSet={[img.srcSmall && `${img.srcSmall} 500w`, `${img.src} 960w`, img.srcLarge && `${img.srcLarge} 1280w`].filter(Boolean).join(', ')}
        sizes="(max-width: 900px) 100vw, 45vw"
        width={img.width || 960}
        height={img.height || 640}
        alt={tx(img.alt)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      <figcaption className="season-photo__caption">
        <Link to={`/treks/${trek.id}`} tabIndex={active ? 0 : -1}>{tx(trek.name)}</Link>
        <span> · {t('photo.credit')}: </span>
        <a href={img.sourceUrl} target="_blank" rel="noreferrer" tabIndex={active ? 0 : -1}>{img.author}</a>
        <span>, </span>
        {img.licenseUrl
          ? <a href={img.licenseUrl} target="_blank" rel="noreferrer license" tabIndex={active ? 0 : -1}>{img.license}</a>
          : img.license}
      </figcaption>
    </figure>
  );
}

export default function SeasonScroll({ seasons, countFor }) {
  const { t, tx } = useLang();
  const [active, setActive] = useState(seasons[0] && seasons[0].id);
  const itemRefs = useRef({});

  // The season whose row is closest to the middle of the screen is active.
  // Measured on scroll (once per frame), so fast jumps and Back/Forward can't leave it stale.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let best = null;
      let bestDist = Infinity;
      Object.entries(itemRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = id; }
      });
      if (best) setActive(prev => (prev === best ? prev : best));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [seasons]);

  return (
    <div className="season-scroll">
      <ol className="season-scroll__list">
        {seasons.map(s => {
          const trek = getTrek(SEASON_TREK[s.id]);
          return (
            <li key={s.id} ref={el => { itemRefs.current[s.id] = el; }} data-season={s.id}
              className={`season-row${active === s.id ? ' is-active' : ''}`} style={{ '--season-color': s.color }}>
              <div className="season-row__inline"><Photo trek={trek} active /></div>
              <Link to={`/treks?season=${s.id}`} className="season-row__link" onFocus={() => setActive(s.id)}>
                <span className="season-row__dot" aria-hidden="true" />
                <h3 className="season-row__name">{tx(s)}</h3>
                <p className="season-row__tagline">{tx(s.tagline)}</p>
                <span className="season-row__count">{t('home.seasonCount', { n: countFor(s) })} →</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="season-scroll__stage" aria-live="off">
        <div className="season-scroll__frame">
          {seasons.map((s, i) => (
            <Photo key={s.id} trek={getTrek(SEASON_TREK[s.id])} active={active === s.id} priority={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
