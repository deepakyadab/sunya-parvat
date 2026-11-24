import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import TrekCard from '../components/TrekCard';
import FindMyTrek from '../components/FindMyTrek';
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
      <section className="hero">
        <motion.div className="hero__bg" style={{ y: heroY }}>
          <img
            src={HERO_PHOTO.src}
            srcSet={`${HERO_PHOTO.srcSmall} 960w, ${HERO_PHOTO.src} 1280w`}
            sizes="100vw"
            alt={tx(HERO_PHOTO.alt)}
            className="hero__img"
            fetchpriority="high"
            decoding="async"
          />
        </motion.div>
        <div className="hero__shade" />

        <div className="hero__content container">
          <p className="hero__eyebrow" lang="hi">शून्य पर्वत</p>
          <h1 className="hero__title">
            {t('home.title1')}<br /><em>{t('home.title2')}</em>
          </h1>
          <p className="hero__sub">{t('home.sub')}</p>

          <div className="hero__ctas">
            <a href="#find-my-trek" onClick={goFind} className="btn btn--primary">{t('home.ctaFind')}</a>
            <Link to="/treks" className="btn btn--ghost">{t('home.ctaBrowse', { n: treks.length })}</Link>
          </div>

          <form className="hero__search" role="search" onSubmit={e => { e.preventDefault(); navigate(q.trim() ? `/treks?q=${encodeURIComponent(q.trim())}` : '/treks'); }}>
            <label htmlFor="hero-search" className="visually-hidden">{t('dir.search')}</label>
            <input id="hero-search" className="field" value={q} onChange={e => setQ(e.target.value)} placeholder={t('home.searchPlaceholder')} />
            <button type="submit" className="btn btn--sm">{t('common.search')}</button>
          </form>

          <p className="hero__stats">{t('home.stats', { n: treks.length, c: countries })}</p>
          <p className="hero__credit">
            {tx(HERO_PHOTO.alt)}. {t('photo.credit')}: <a href={HERO_PHOTO.sourceUrl} target="_blank" rel="noreferrer">{HERO_PHOTO.author}</a>,{' '}
            <a href={HERO_PHOTO.licenseUrl} target="_blank" rel="noreferrer license">{HERO_PHOTO.license}</a>
          </p>
        </div>
      </section>

      <section className="home-section container">
        <FindMyTrek />
      </section>

      <section className="home-section container">
        <FadeIn>
          <div className="section-head">
            <div>
              <p className="section-label">{t('home.seasonEyebrow')}</p>
              <h2 className="section-title">{t('home.seasonTitle')}</h2>
            </div>
          </div>
        </FadeIn>
        <div className="seasons__grid">
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
        </div>
      </section>

      <section className="home-section container">
        <div className="section-head">
          <div>
            <p className="section-label">{t('home.featuredEyebrow')}</p>
            <h2 className="section-title">{t('home.featuredTitle')}</h2>
          </div>
          <Link to="/treks" className="link-subtle">{t('home.allTreks')} →</Link>
        </div>
        <div className="trek-grid">
          {featured.map(trek => <TrekCard key={trek.id} trek={trek} />)}
        </div>
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
