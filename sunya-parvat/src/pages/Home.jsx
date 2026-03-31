import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import JourneyCard from '../components/JourneyCard';
import { journeys, emotionalFilters, seasons, stories } from '../data/content';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const featuredJourneys = journeys.filter(j => j.featured);

  const filteredJourneys = selectedFilter
    ? journeys.filter(j => j.emotional_tags.includes(selectedFilter.id))
    : featuredJourneys;

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <motion.div className="hero__bg" style={{ y: heroY }} />
        <div className="hero__noise" />

        <motion.div className="hero__content" style={{ opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero__eyebrow section-label"
          >
            शून्य पर्वत
          </motion.div>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Into the mountains.
            <br />
            <em>Into the self.</em>
          </motion.h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.1 }}
          >
            Not a trekking company. A philosophical mountain experience.
          </motion.p>

          <motion.div
            className="hero__scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <span />
          </motion.div>
        </motion.div>

        <div className="hero__gradient-bottom" />
      </section>

      {/* ── Find Your Journey ── */}
      <section className="find-journey">
        <div className="container">
          <FadeIn>
            <div className="section-label">Find Your Journey</div>
            <h2 className="find-journey__heading">
              Not where you want to go.<br />
              <em>Why</em> you want to go.
            </h2>
          </FadeIn>

          <div className="find-journey__filters">
            {emotionalFilters.map((filter, i) => (
              <FadeIn key={filter.id} delay={i * 0.1}>
                <button
                  className={`filter-btn ${selectedFilter?.id === filter.id ? 'filter-btn--active' : ''}`}
                  onClick={() => setSelectedFilter(selectedFilter?.id === filter.id ? null : filter)}
                >
                  <span className="filter-btn__label">{filter.label}</span>
                  <span className="filter-btn__desc">{filter.description}</span>
                </button>
              </FadeIn>
            ))}
          </div>

          {selectedFilter && (
            <motion.div
              className="filter-result"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.6 }}
            >
              <p className="filter-result__label section-label">
                Journeys for <em style={{ fontStyle: 'italic', color: 'var(--text-accent)' }}>"{selectedFilter.label}"</em>
              </p>
            </motion.div>
          )}

          <div className="home-journeys__grid">
            {filteredJourneys.map((journey, i) => (
              <JourneyCard key={journey.id} journey={journey} index={i} />
            ))}
          </div>

          <FadeIn>
            <div className="home-journeys__more">
              <Link to="/journeys" className="link-subtle">
                All journeys &rarr;
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Seasonal Exploration ── */}
      <section className="seasons">
        <div className="container">
          <FadeIn>
            <div className="section-label">Seasonal Exploration</div>
            <h2 className="seasons__heading">
              The mountain is never the same place twice.
            </h2>
          </FadeIn>

          <div className="seasons__grid">
            {seasons.map((season, i) => (
              <FadeIn key={season.id} delay={i * 0.1}>
                <Link
                  to={`/journeys?season=${season.id}`}
                  className="season-card"
                  style={{ '--season-color': season.color }}
                >
                  <div className="season-card__dot" />
                  <h3 className="season-card__name">{season.name}</h3>
                  <p className="season-card__tagline">{season.tagline}</p>
                  <p className="season-card__desc">{season.description}</p>
                  <span className="season-card__count section-label">
                    {season.journeyIds.length} {season.journeyIds.length === 1 ? 'journey' : 'journeys'}
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stories Preview ── */}
      <section className="stories-preview">
        <div className="container">
          <FadeIn>
            <div className="section-label">From the Mountains</div>
            <h2 className="stories-preview__heading">Stories, not posts.</h2>
          </FadeIn>

          <div className="stories-preview__list">
            {stories.slice(0, 3).map((story, i) => (
              <FadeIn key={story.id} delay={i * 0.1}>
                <Link to={`/stories/${story.id}`} className="story-row">
                  <div className="story-row__left">
                    <span className="story-row__category section-label">{story.category}</span>
                    <h3 className="story-row__title">{story.title}</h3>
                    <p className="story-row__subtitle">{story.subtitle}</p>
                  </div>
                  <div className="story-row__right">
                    <span className="story-row__read">{story.readTime}</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="stories-preview__more">
              <Link to="/stories" className="link-subtle">All stories &rarr;</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── About Preview ── */}
      <section className="about-preview">
        <div className="container--narrow">
          <FadeIn>
            <blockquote className="about-preview__quote">
              <p>
                Sunya Parvat is not a company. It is an orientation.
                A way of going into the mountains that takes the inner journey
                as seriously as the outer one.
              </p>
              <footer>— Deepak Yadav</footer>
            </blockquote>
            <Link to="/about" className="link-subtle">Read the full story &rarr;</Link>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
