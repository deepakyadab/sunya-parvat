import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useLang } from '../../i18n';
import './Hero3D.css';

/*
  Home hero with a 3D mountain fly-through behind the EXISTING hero layout.
  Only the background changes (photo → 3D landscape, approved by the owner);
  the hero's classes, text, buttons, search and spacing are the site's own.

  Timeline (seconds from the first rendered frame), one continuous camera move:
    0.0 misted valley · 1.6 movement begins · 2.5 layers separate · 5.0 fly-over
    6.5 the sunlit massif takes the frame · 9.3 camera settles toward the composition
    11.0 शून्य पर्वत · 11.6 "Into the mountains." · 12.3 "Into the self." · 13.0 the rest
    14.5 final, stable frame; only clouds and a slow camera breath keep moving.

  - Plays once per visit (sessionStorage); later visits open on the final frame.
  - Skip button, focusing anything in the hero, or scrolling ends the intro at once.
  - prefers-reduced-motion: one still 3D frame of the final composition.
  - No WebGL (or if the scene fails): the existing photo hero (`fallback`).
  - ?introAt=5.0 freezes the timeline for review stills; ?capture=1 exposes
    window.__spSeek(t) so a recorder can render exact frames.
*/

const STAGES = { logo: [11.0, 1.3], t1: [11.6, 1.3], t2: [12.3, 1.3], rest: [13.0, 1.3] };
const END = 14.5;
const SEEN_KEY = 'sp-intro-seen';
const ease = x => 1 - Math.pow(1 - x, 3);

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

function lowPower() {
  const small = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  return small || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
}

export default function Hero3D({ fallback, children }) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const hostRef = useRef(null);
  const contentRef = useRef(null);
  const skipRef = useRef(() => {});
  const [mode, setMode] = useState('3d'); // 3d | fallback
  const [intro, setIntro] = useState(false);

  // Reveal progress goes straight into CSS variables: no React re-render per frame.
  const paint = useCallback((time, scrollP = 0) => {
    const el = contentRef.current;
    const sec = sectionRef.current;
    if (!el || !sec) return;
    // variables live on the section so the shade can follow the text reveal too
    Object.entries(STAGES).forEach(([k, [start, dur]]) => {
      sec.style.setProperty(`--p-${k}`, ease(Math.min(1, Math.max(0, (time - start) / dur))).toFixed(3));
    });
    el.dataset.ready = time >= STAGES.rest[0] + 0.4 ? 'true' : 'false';
    // as on the photo hero, the text rises and fades as you scroll away
    el.style.transform = scrollP ? `translate3d(0, ${(-90 * scrollP).toFixed(1)}px, 0)` : '';
    el.style.opacity = scrollP ? String(Math.max(0, 1 - scrollP / 0.85)) : '';
  }, []);

  useEffect(() => {
    if (!webglOK()) { setMode('fallback'); return undefined; }
    const params = new URLSearchParams(window.location.search);
    const frozenAt = params.has('introAt') ? Math.max(0, Math.min(END, Number(params.get('introAt')) || 0)) : null;
    const capture = params.has('capture');
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) { /* storage blocked */ }
    const still = reduce || frozenAt != null || capture;
    const startAt = frozenAt != null ? frozenAt : capture ? 0 : (reduce || seen ? END : 0);
    const playing = !still && startAt < END;

    let scene = null;
    let raf = 0;
    let disposed = false;
    let visible = true;
    let t0 = 0;
    let offset = startAt;
    const heroH = () => Math.max(1, sectionRef.current ? sectionRef.current.offsetHeight : 1);
    const scrollP = () => Math.min(1, window.scrollY / heroH());

    paint(startAt);
    if (playing) setIntro(true);

    const finishIntro = () => {
      setIntro(false);
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
    };
    let finished = !playing;

    const loop = now => {
      if (disposed) return;
      if (!t0) t0 = now;
      const wall = offset + (now - t0) / 1000;
      const tl = Math.min(wall, END);
      if (visible) {
        const p = scrollP();
        scene.setScroll(p);
        scene.renderAt(tl, wall);
        paint(tl, p);
      }
      if (!finished && tl >= STAGES.logo[0]) { finished = true; finishIntro(); }
      raf = requestAnimationFrame(loop);
    };

    skipRef.current = () => {
      if (finished) return;
      offset = END; t0 = 0; finished = true;
      paint(END, scrollP());
      finishIntro();
    };

    const drawStill = () => { if (scene) { const p = scrollP(); scene.setScroll(p); scene.renderAt(startAt, startAt); paint(startAt, p); } };
    const onScroll = () => {
      if (!finished && window.scrollY > 40) skipRef.current();
      if (still && !capture) drawStill();
    };
    const onResize = () => { if (scene) { scene.resize(); if (still) drawStill(); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    const onVis = () => { visible = !document.hidden; };

    // Load three.js and build the terrain after the page has painted.
    const idle = window.requestIdleCallback || (cb => setTimeout(cb, 60));
    idle(() => {
      import(/* webpackChunkName: "mountain-scene" */ './MountainScene').then(({ createMountainScene }) => {
        if (disposed || !hostRef.current) return;
        try {
          const tBuild = performance.now();
          scene = createMountainScene(hostRef.current, { quality: lowPower() ? 'low' : 'high' });
          if (capture) window.__spBuildMs = Math.round(performance.now() - tBuild);
        } catch (e) {
          setMode('fallback'); return;
        }
        hostRef.current.dataset.ready = 'true';
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVis);
        if (sectionRef.current) io.observe(sectionRef.current);
        if (capture) {
          window.__spSeek = time => { scene.renderAt(time, time); paint(time); return time; };
          window.__spProbe = time => scene.probe(time);
          window.__spSeek(startAt);
        } else if (still) {
          drawStill();
        } else {
          raf = requestAnimationFrame(loop);
        }
      }).catch(() => setMode('fallback'));
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
      if (window.__spSeek) delete window.__spSeek;
      if (scene) scene.dispose();
    };
  }, [reduce, paint]);

  if (mode === 'fallback') return fallback;

  return (
    <section className="hero hero--3d" ref={sectionRef} onFocusCapture={() => skipRef.current()}>
      <div className="hero3d__canvas" ref={hostRef} />
      <div className="hero__shade" />
      <div className="hero__content container hero3d__content" ref={contentRef}>
        {children}
      </div>
      {intro && (
        <button type="button" className="hero3d__skip" onClick={() => skipRef.current()}>{t('hero.skip')}</button>
      )}
    </section>
  );
}
