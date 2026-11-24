import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import EnquiryForm from '../components/EnquiryForm';
import { getTrek } from '../data/treks';
import usePageMeta from '../lib/usePageMeta';
import './Connect.css';

/*
  The form posts to /api/enquiry, which emails Sunya Parvat (see api/_lib/enquiry.js).
  ?trek=<id> preselects the trek the visitor is asking about.
*/
export default function Connect() {
  const [params] = useSearchParams();
  const trek = getTrek(params.get('trek') || '');

  usePageMeta({ title: 'Connect', description: 'Ask a question about a trek or write to Sunya Parvat.', path: '/connect' });

  return (
    <div className="page-wrapper connect-page">

      <div className="connect__header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>Connect</div>
            <h1 className="page-title">
              The journey continues<br />
              <em style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>in conversation.</em>
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container connect__body">
        <div className="connect__grid">

          {/* Form */}
          <div className="connect__form-side">
            <FadeIn>
              <p className="connect__intro">
                If something here moved you. If you have a question about a journey.
                If you want to tell me what happened to you on a mountain.
                I would like to hear it.
              </p>
            </FadeIn>
            <EnquiryForm key={trek ? trek.id : 'general'} trek={null} idPrefix="connect" initialTrek={trek ? trek.id : ''} />
          </div>

          {/* Instagram */}
          <div className="connect__instagram-side">
            <FadeIn delay={0.2}>
              <div className="connect__instagram">
                <div className="section-label" style={{ marginBottom: '2rem' }}>On Instagram</div>
                <h2 className="connect__ig-heading">
                  Follow the journey,<br />
                  not the destination.
                </h2>
                <p className="connect__ig-text">
                  I post slowly. When there is something worth sharing — a view, a thought, a moment
                  from the trail that does not reduce to a caption — it appears here.
                </p>
                <p className="connect__ig-text">
                  No daily uploads. No motivational quotes over landscape photographs. Just honest
                  documentation of what the mountains offer to those who pay attention.
                </p>
                <a
                  href="https://instagram.com/sunya_parvat"
                  target="_blank"
                  rel="noreferrer"
                  className="connect__ig-link"
                >
                  <span className="connect__ig-handle">@sunya_parvat</span>
                  <span className="connect__ig-arrow">→</span>
                </a>
              </div>
            </FadeIn>

            {/* Philosophy note */}
            <FadeIn delay={0.3}>
              <div className="connect__note">
                <p>
                  Sunya Parvat does not run group treks.<br />
                  There are no packages to book here.<br />
                  What is offered is context, orientation, and<br />
                  the company of people who have gone before.
                </p>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </div>
  );
}
