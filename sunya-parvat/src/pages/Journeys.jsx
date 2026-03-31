import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import JourneyCard from '../components/JourneyCard';
import { journeys, emotionalFilters, seasons } from '../data/content';
import './Journeys.css';

export default function Journeys() {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);

  useEffect(() => {
    const season = searchParams.get('season');
    if (season) setActiveSeason(season);
  }, [searchParams]);

  const filtered = journeys.filter(j => {
    const emotionMatch = !activeFilter || j.emotional_tags.includes(activeFilter);
    const seasonMatch = !activeSeason || j.season.includes(activeSeason);
    return emotionMatch && seasonMatch;
  });

  return (
    <div className="page-wrapper journeys-page">
      <div className="page-hero page-hero--small">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>Journeys</div>
            <h1 className="page-title">
              Every trail is<br />a different question.
            </h1>
            <p className="page-subtitle">
              We do not sell trekking packages. We offer entry points<br />
              into a slower, more attentive kind of movement.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <FadeIn>
          <div className="journeys-filters">
            <div className="journeys-filters__section">
              <span className="section-label">By Intention</span>
              <div className="journeys-filters__row">
                {emotionalFilters.map(f => (
                  <button
                    key={f.id}
                    className={`tag-btn ${activeFilter === f.id ? 'tag-btn--active' : ''}`}
                    onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="journeys-filters__section">
              <span className="section-label">By Season</span>
              <div className="journeys-filters__row">
                {seasons.map(s => (
                  <button
                    key={s.id}
                    className={`tag-btn ${activeSeason === s.id ? 'tag-btn--active' : ''}`}
                    onClick={() => setActiveSeason(activeSeason === s.id ? null : s.id)}
                    style={{ '--tag-color': s.color }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {(activeFilter || activeSeason) && (
              <button className="clear-btn" onClick={() => { setActiveFilter(null); setActiveSeason(null); }}>
                Clear filters
              </button>
            )}
          </div>
        </FadeIn>

        {/* Results */}
        <div className="journeys-grid">
          {filtered.length > 0 ? (
            filtered.map((journey, i) => (
              <JourneyCard key={journey.id} journey={journey} index={i} />
            ))
          ) : (
            <FadeIn>
              <div className="journeys-empty">
                <p>No journeys match this combination.<br />Try a different intention.</p>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}
