import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import TrekCard from '../components/TrekCard';
import FindMyTrek from '../components/FindMyTrek';
import { RevealWords, Rise, StaggerGrid, EASE } from '../components/motion/Motion';
import { treks } from '../data/treks';
import { seasons } from '../data/taxonomy';
import { articles } from '../data/journal';
import { HERO_PHOTO } from '../data/sitePhotos';
import { useLang } from '../i18n';
import usePageMeta from '../lib/usePageMeta';
import './Home.css';

const FEATURED = ['kedarkantha', 'valley-of-flowers', 'kuari-pass', 'kashmir-great-lakes', 'sandakphu-phalut', 'everest-base-camp'];

export default function Home() {
  const { t, tx } = useLang();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [q, setQ] = useState('');
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 100]);

  // Hero camera: scroll-driven dolly and tilt on the photo, with the text moving
  // faster than the photo so the two separate in depth. Motion only; layout unchanged.
  const heroRef = useRef(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const camScale = useTransform(heroP, [0, 1], [1, reduce ? 1 : 1.16]);
  const camTilt = useTransform(heroP, [0, 1], [0, reduce ? 0 : 7]);
  const contentY = useTransform(heroP, [0, 1], [0, reduce ? 0 : -90]);
  const contentFade = useTransform(heroP, [0, 0.85], [1, reduce ? 1 : 0]);
  const spring = { stiffness: 40, damping: 18, mass: 1 };
  const camX = useSpring(0, spring);
  const camY = useSpring(0, spring);
  const camPan = useSpring(0, spring);
  const finePointer = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  const onHeroPointer = e => {
    if (reduce || !finePointer) return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    camX.set(-nx * 18); camY.set(-ny * 12); camPan.set(nx * 1.6);
  };
  const resetHeroPointer = () => { camX.set(0); camY.set(0); camPan.set(0); };

  usePageMeta({ title: null, description: t('meta.home'), path: '/' });

  const featured = FEATURED.map(id => treks.find(x => x.id === id)).filter(Boolean);
  const guides = articles.filter(a => a.kind === 'guide' && a.languages.includes('hi')).slice(0, 3);
  const countries = new Set(treks.flatMap(x => x.countries)).size;

  const goFind = e => {
    e.preventDefault();
    document.getElementById('find-my-trek')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="home">
      <section className="hero" ref={heroRef} onPointerMove={onHeroPointer} onPointerLeave={resetHeroPointer}>
        <motion.div className="hero__bg" style={{ y: heroY }}>
          {/* Camera: dollies in and tilts back as you scroll, leans slightly toward the pointer. */}
          <motion.div className="hero__camera" style={{ scale: camScale, rotateX: camTilt, rotateY: camPan, x: camX, y: camY }}>
            <div className="hero__drift">
              {/* The photo settles in: a slow fade and a slight pull-back, like eyes adjusting to the light. */}
              <motion.img
                src={HERO_PHOTO.src}
                srcSet={`${HERO_PHOTO.srcSmall} 960w, ${HERO_PHOTO.src} 1280w`}
                sizes="100vw"
                alt={tx(HERO_PHOTO.alt)}
                className="hero__img"
                fetchpriority="high"
                decoding="async"
                initial={reduce ? false : { opacity: 0.15, scale: 1.08 }}
                animate={{ opacity: 0.62, scale: 1 }}
                transition={{ opacity: { duration: 1.6, ease: 'easeOut' }, scale: { duration: 2.6, ease: EASE } }}
              />
            </div>
          </motion.div>
        </motion.div>
        <div className="hero__shade" />

        <motion.div className="hero__content container" style={{ y: contentY, opacity: contentFade }}>
          <Rise as="p" className="hero__eyebrow" lang="hi" delay={0.15}>शून्य पर्वत</Rise>
          <h1 className="hero__title">
            <RevealWords text={t('home.title1')} delay={0.3} /><br />
            <em><RevealWords text={t('home.title2')} delay={0.75} /></em>
          </h1>
          <Rise as="p" className="hero__sub" delay={1.05}>{t('home.sub')}</Rise>

          <Rise className="hero__ctas" delay={1.2}>
            <a href="#find-my-trek" onClick={goFind} className="btn btn--primary">{t('home.ctaFind')}</a>
            <Link to="/treks" className="btn btn--ghost">{t('home.ctaBrowse', { n: treks.length })}</Link>
          </Rise>

          <Rise as="form" delay={1.32} className="hero__search" role="search" onSubmit={e => { e.preventDefault(); navigate(q.trim() ? `/treks?q=${encodeURIComponent(q.trim())}` : '/treks'); }}>
            <label htmlFor="hero-search" className="visually-hidden">{t('dir.search')}</label>
            <input id="hero-search" className="field" value={q} onChange={e => setQ(e.target.value)} placeholder={t('home.searchPlaceholder')} />
            <button type="submit" className="btn btn--sm">{t('common.search')}</button>
          </Rise>

          <Rise as="p" className="hero__stats" delay={1.44}>{t('home.stats', { n: treks.length, c: countries })}</Rise>
          <p className="hero__credit">
            {tx(HERO_PHOTO.alt)}. {t('photo.credit')}: <a href={HERO_PHOTO.sourceUrl} target="_blank" rel="noreferrer">{HERO_PHOTO.author}</a>,{' '}
            <a href={HERO_PHOTO.licenseUrl} target="_blank" rel="noreferrer license">{HERO_PHOTO.license}</a>
          </p>
        </motion.div>
      </section>

      <section className="home-section container">
        <FindMyTrek />
      </section>

      <section className="home-section container">
        <div className="section-head">
          <div>
            <Rise as="p" className="section-label" inView>{t('home.seasonEyebrow')}</Rise>
            <h2 className="section-title"><RevealWords text={t('home.seasonTitle')} inView /></h2>
          </div>
        </div>
        <StaggerGrid className="seasons__grid" step={0.1}>
          {seasons.map(s => {
            const n = treks.filter(x => x.bestSeasons.includes(s.id)).length;
            return (
              <Link key={s.id} to={`/treks?season=${s.id}`} className="season-card" style={{ '--season-color': s.color }}>
                <span className="season-card__dot" aria-hidden="true" />
                <h3 className="season-card__name">{tx(s)}</h3>
                <p className="season-card__tagline">{tx(s.tagline)}</p>
                <span className="season-card__count">{t('home.seasonCount', { n })} →</span>
              </Link>
            );
          })}
        </StaggerGrid>
      </section>

      <section className="home-section container">
        <div className="section-head">
          <div>
            <Rise as="p" className="section-label" inView>{t('home.featuredEyebrow')}</Rise>
            <h2 className="section-title"><RevealWords text={t('home.featuredTitle')} inView /></h2>
          </div>
          <Link to="/treks" className="link-subtle">{t('home.allTreks')} →</Link>
        </div>
        <StaggerGrid className="trek-grid">
          {featured.map(trek => <TrekCard key={trek.id} trek={trek} />)}
        </StaggerGrid>
      </section>

      <section className="home-section container">
        <div className="section-head">
          <div>
            <p className="section-label">{t('nav.journal')}</p>
            <h2 className="section-title">{t('home.journalTitle')}</h2>
          </div>
          <Link to="/journal" className="link-subtle">{t('home.allArticles')} →</Link>
        </div>
        <div className="story-list">
          {guides.map(a => (
            <Link key={a.id} to={`/journal/${a.id}`} className="story-row">
              <div className="story-row__left">
                <h3 className="story-row__title">{tx(a.title)}</h3>
                <p className="story-row__subtitle">{tx(a.summary)}</p>
              </div>
              <span className="story-row__read">{t('journal.minutes', { n: a.readTime })}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-preview">
        <div className="container--narrow">
          <FadeIn>
            <blockquote className="about-preview__quote">
              <p>{t('home.quote')}</p>
              <footer>— Deepak Yadav</footer>
            </blockquote>
            <Link to="/about" className="link-subtle">{t('home.readStory')} →</Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
