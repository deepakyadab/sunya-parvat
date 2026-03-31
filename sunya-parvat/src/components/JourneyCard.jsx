import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getGradient } from '../data/gradients';
import './JourneyCard.css';

export default function JourneyCard({ journey, index = 0 }) {
  return (
    <motion.div
      className="jcard"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link to={`/journeys/${journey.id}`} className="jcard__link">
        <div
          className="jcard__image"
          style={{ background: getGradient(journey.image_placeholder) }}
        >
          <div className="jcard__image-overlay" />
          <div className="jcard__meta">
            <span className="jcard__season">
              {journey.season.join(' · ')}
            </span>
          </div>
        </div>
        <div className="jcard__body">
          <div className="jcard__location">{journey.location}</div>
          <h3 className="jcard__title">{journey.title}</h3>
          <p className="jcard__subtitle">{journey.subtitle}</p>
          <div className="jcard__stats">
            <span>{journey.duration}</span>
            <span className="jcard__dot">·</span>
            <span>{journey.altitude}</span>
            <span className="jcard__dot">·</span>
            <span className="jcard__difficulty">{journey.difficulty}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
