import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import { journeys } from '../data/content';
import { getGradient } from '../data/gradients';
import './JourneyDetail.css';

export default function JourneyDetail() {
  const { id } = useParams();
  const journey = journeys.find(j => j.id === id);

  if (!journey) {
    return (
      <div className="page-wrapper" style={{ padding: '14rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
          This path does not exist.
        </p>
        <Link to="/journeys" style={{ marginTop: '2rem', display: 'inline-block', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          &larr; Back to journeys
        </Link>
      </div>
    );
  }

  return (
    <div className="jd page-wrapper">
      {/* Hero */}
      <div className="jd__hero" style={{ background: getGradient(journey.image_placeholder) }}>
        <div className="jd__hero-noise" />
        <div className="jd__hero-gradient" />
        <motion.div
          className="jd__hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <Link to="/journeys" className="jd__back">← All Journeys</Link>
          <div className="section-label" style={{ marginBottom: '1.5rem' }}>{journey.location}</div>
          <h1 className="jd__title">{journey.title}</h1>
          <p className="jd__subtitle">{journey.subtitle}</p>
          <div className="jd__stats">
            {journey.duration} &nbsp;·&nbsp; {journey.altitude} &nbsp;·&nbsp; {journey.difficulty}
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="container--narrow jd__body">
        {/* Opening description */}
        <FadeIn>
          <p className="jd__description">{journey.description}</p>
        </FadeIn>

        <FadeIn>
          <div className="divider" />
        </FadeIn>

        {/* Emotional Tags */}
        <FadeIn>
          <div className="jd__tags">
            <span className="section-label" style={{ marginRight: '1.5rem' }}>This journey is for those who seek</span>
            {journey.emotional_tags.map(tag => (
              <span key={tag} className="jd__tag">{tag}</span>
            ))}
          </div>
        </FadeIn>

        {/* Day by Day */}
        <section className="jd__days">
          <FadeIn>
            <h2 className="jd__section-title">What you experience, day by day.</h2>
            <p className="jd__section-intro">
              Not an itinerary. Not a schedule.<br />
              A sequence of encounters.
            </p>
          </FadeIn>

          <div className="jd__day-list">
            {journey.day_experiences.map((day, i) => (
              <FadeIn key={day.day} delay={i * 0.08}>
                <div className="jd__day">
                  <div className="jd__day-number">Day {day.day}</div>
                  <div className="jd__day-content">
                    <h3 className="jd__day-title">{day.title}</h3>
                    <p className="jd__day-text">{day.text}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Best Time */}
        <FadeIn>
          <div className="jd__besttime">
            <div className="section-label" style={{ marginBottom: '1rem' }}>Best Time to Go</div>
            <p className="jd__besttime-text">{journey.best_time}</p>
          </div>
        </FadeIn>

        {/* Practical info */}
        <FadeIn>
          <div className="jd__practical">
            <div className="jd__practical-grid">
              <div>
                <div className="section-label">Duration</div>
                <span>{journey.duration}</span>
              </div>
              <div>
                <div className="section-label">Maximum Altitude</div>
                <span>{journey.altitude}</span>
              </div>
              <div>
                <div className="section-label">Difficulty</div>
                <span style={{ textTransform: 'capitalize' }}>{journey.difficulty}</span>
              </div>
              <div>
                <div className="section-label">Region</div>
                <span>{journey.location}</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <div className="jd__cta">
            <p className="jd__cta-text">
              Before you decide to go — read what the mountain asks of you.
            </p>
            <Link to="/before-you-go" className="jd__cta-link">
              Before You Go →
            </Link>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}
