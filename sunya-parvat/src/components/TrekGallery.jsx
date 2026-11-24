import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';
import './TrekGallery.css';

/*
  Trek photo gallery.

  Photos live in src/data/treks/galleries/<trek-id>.json (one array per trek, same
  fields as a trek's "image"), loaded only when the trek page opens so the catalog
  bundle stays small. A trek without a file simply shows no gallery: fewer photos
  are better than unrelated ones.
*/
export function loadGallery(id) {
  return import(/* webpackChunkName: "gallery-[request]" */ `../data/treks/galleries/${id}.json`)
    .then(m => (Array.isArray(m.default) ? m.default : []))
    .catch(() => []);
}

export function useGallery(id) {
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    let live = true;
    setPhotos([]);
    loadGallery(id).then(p => { if (live) setPhotos(p.filter(x => x && x.src && x.license && x.sourceUrl)); });
    return () => { live = false; };
  }, [id]);
  return photos;
}

const srcSet = p => [p.srcSmall && `${p.srcSmall} 500w`, `${p.src} 960w`, p.srcLarge && `${p.srcLarge} 1280w`].filter(Boolean).join(', ');

function Credit({ p }) {
  const { t, tx } = useLang();
  return (
    <span className="gallery-credit">
      {p.scope === 'regional' && <strong className="gallery-credit__scope">{t('photo.regional')}{p.subject ? `: ${tx(p.subject)}` : ''}. </strong>}
      <a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.author || 'Wikimedia Commons'}</a>
      {' · '}
      {p.licenseUrl ? <a href={p.licenseUrl} target="_blank" rel="noreferrer license">{p.license}</a> : p.license}
    </span>
  );
}

function Lightbox({ photos, index, onIndex, onClose, title }) {
  const { t, tx } = useLang();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const touch = useRef(null);
  const p = photos[index];
  const go = useCallback(d => onIndex((index + d + photos.length) % photos.length), [index, photos.length, onIndex]);

  useEffect(() => {
    closeRef.current && closeRef.current.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const onKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = dialogRef.current.querySelectorAll('button, a[href]');
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={t('gallery.dialog', { name: title })}
      ref={dialogRef} onKeyDown={onKey}
      onTouchStart={e => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}>
      <div className="lightbox__backdrop" onClick={onClose} />
      <div className="lightbox__bar">
        <p className="lightbox__count" aria-live="polite">{t('gallery.count', { n: index + 1, total: photos.length })}</p>
        <button ref={closeRef} type="button" className="icon-btn lightbox__close" onClick={onClose} aria-label={t('common.close')}>×</button>
      </div>
      <figure className="lightbox__figure">
        <img key={p.src} src={p.srcLarge || p.src} srcSet={srcSet(p)} sizes="100vw" alt={tx(p.alt)}
          width={p.width || 960} height={p.height || 640} />
        <figcaption className="lightbox__caption"><Credit p={p} /></figcaption>
      </figure>
      {photos.length > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label={t('gallery.prev')}>‹</button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label={t('gallery.next')}>›</button>
        </>
      )}
    </div>
  );
}

export default function TrekGallery({ trek, photos }) {
  const { t, tx } = useLang();
  const [open, setOpen] = useState(null);
  const triggers = useRef([]);
  if (!photos.length) return null;
  const name = tx(trek.name);
  // 3-column grid, first photo 2×2: widen the last tile so the final row is never ragged.
  const spare = photos.length >= 3 ? (photos.length + 3) % 3 : 0;
  const lastSpan = spare === 1 ? 3 : spare === 2 ? 2 : 1;

  const close = () => {
    const i = open;
    setOpen(null);
    // return focus to the photo that opened the viewer
    setTimeout(() => triggers.current[i] && triggers.current[i].focus(), 0);
  };

  return (
    <div className="gallery">
      <ul className={`gallery__grid gallery__grid--${Math.min(photos.length, 5)}`}>
        {photos.map((p, i) => (
          <li key={p.sourceUrl} className={`gallery__item${i === photos.length - 1 && lastSpan > 1 ? ` gallery__item--span${lastSpan}` : ''}`}>
            <button type="button" className="gallery__btn" ref={el => { triggers.current[i] = el; }}
              onClick={() => setOpen(i)} aria-label={t('gallery.open', { n: i + 1, total: photos.length, alt: tx(p.alt) })}>
              <img src={p.srcSmall || p.src} srcSet={srcSet(p)}
                sizes={i === 0 ? '(max-width: 700px) 85vw, 640px' : '(max-width: 700px) 85vw, 320px'}
                width={p.width || 960} height={p.height || 640} alt="" loading="lazy" decoding="async" />
              {p.scope === 'regional' && <span className="gallery__scope">{t('photo.regional')}</span>}
            </button>
          </li>
        ))}
      </ul>
      <p className="gallery__credits">
        {t('gallery.credits')}{' '}
        {photos.map((p, i) => <React.Fragment key={p.sourceUrl}>{i > 0 && '; '}<Credit p={p} /></React.Fragment>)}
      </p>
      {open != null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={close} title={name} />}
    </div>
  );
}
