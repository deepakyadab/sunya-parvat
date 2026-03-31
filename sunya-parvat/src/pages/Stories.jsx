import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import { stories } from '../data/content';
import './Stories.css';

const categories = ['all', 'mountains', 'reflections', 'guides'];

export default function Stories() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? stories
    : stories.filter(s => s.category === activeCategory);

  return (
    <div className="page-wrapper stories-page">
      <div className="page-hero page-hero--small">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>Stories</div>
            <h1 className="page-title">
              The mountain speaks.<br />
              <em style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>These are the translations.</em>
            </h1>
            <p className="page-subtitle">
              Not travel writing. Not adventure journalism.<br />
              Personal accounts of what happens when you go up and come back changed.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container">
        {/* Category Tabs */}
        <FadeIn>
          <div className="stories-cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`stories-cat ${activeCategory === cat ? 'stories-cat--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Stories List */}
        <div className="stories-list">
          {filtered.map((story, i) => (
            <FadeIn key={story.id} delay={i * 0.08}>
              <Link to={`/stories/${story.id}`} className="story-item">
                <div className="story-item__meta">
                  <span className="section-label">{story.category}</span>
                  <span className="story-item__date">{story.date}</span>
                </div>
                <div className="story-item__body">
                  <h2 className="story-item__title">{story.title}</h2>
                  <p className="story-item__subtitle">{story.subtitle}</p>
                  <p className="story-item__preview">{story.preview}</p>
                </div>
                <div className="story-item__footer">
                  <span className="story-item__read">{story.readTime} read</span>
                  <span className="story-item__arrow">→</span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Editorial note */}
        <FadeIn>
          <div className="stories-note">
            <p>
              These stories are written slowly.<br />
              Published only when they are ready.<br />
              There is no editorial calendar here.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
