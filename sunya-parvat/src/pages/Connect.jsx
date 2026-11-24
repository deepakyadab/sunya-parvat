import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import { getTrek } from '../data/treks';
import usePageMeta from '../lib/usePageMeta';
import './Connect.css';

/*
  There is no form backend in this project, so the form opens the visitor's
  own email app with the message filled in, instead of pretending to send it.
  To receive messages on the site itself, connect a form service (see README).
*/
export const CONTACT_EMAIL = 'sunyaparvat@gmail.com';

export default function Connect() {
  const [params] = useSearchParams();
  const trek = getTrek(params.get('trek') || '');
  const [form, setForm] = useState({
    name: '', email: '',
    message: trek ? `I have a question about ${trek.name.en}: ` : '',
  });
  const [submitted, setSubmitted] = useState(false);

  usePageMeta({ title: 'Connect', description: 'Ask a question about a trek or write to Sunya Parvat.', path: '/connect' });

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const subject = trek ? `Question about ${trek.name.en}` : 'A note from the Sunya Parvat website';
    const body = `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ''}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

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

            {!submitted ? (
              <FadeIn delay={0.1}>
                <form className="connect__form" onSubmit={handleSubmit}>
                  <div className="form-field">
                    <label className="form-label section-label" htmlFor="name">Your name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-input"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="How do you wish to be known"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label section-label" htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-input"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Where I can write back"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label section-label" htmlFor="message">Your message</label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-input form-textarea"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Say what you need to say. There is no required format here."
                      rows={7}
                      required
                    />
                  </div>

                  <button type="submit" className="form-submit">
                    Open in my email app →
                  </button>
                  <p className="connect__hint">
                    This opens your own email app with the message ready to send. Or write directly to{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">{CONTACT_EMAIL}</a>.
                  </p>
                </form>
              </FadeIn>
            ) : (
              <motion.div
                className="connect__thanks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="connect__thanks-text">
                  Your email app should have opened with your message. Once you press send there, I will read it carefully and write back.
                </p>
                <p className="connect__hint">
                  Nothing opened? Copy your message and write to{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">{CONTACT_EMAIL}</a>.{' '}
                  <button type="button" className="btn-text" onClick={() => setSubmitted(false)}>Back to the form</button>
                </p>
                <span className="connect__thanks-sig">— Deepak</span>
              </motion.div>
            )}
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
