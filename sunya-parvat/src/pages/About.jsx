import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import { getGradient } from '../data/gradients';
import './About.css';

export default function About() {
  return (
    <div className="page-wrapper about-page">

      {/* Hero */}
      <div className="about__hero" style={{ background: getGradient('about') }}>
        <div className="about__hero-noise" />
        <div className="about__hero-gradient" />
        <motion.div
          className="about__hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          <div className="section-label" style={{ marginBottom: '2rem' }}>About</div>
          <h1 className="about__hero-title">
            This began as<br />
            a personal question.
          </h1>
        </motion.div>
      </div>

      <div className="container--narrow about__body">

        {/* Origin */}
        <section className="about__section">
          <FadeIn>
            <div className="section-label" style={{ marginBottom: '2rem' }}>The Beginning</div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="about__text">
              I went to the mountains the first time because I was told they were beautiful.
              I went the second time because I could not explain what had happened to me the first time.
              By the fifth time, I had stopped needing a reason.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="about__text">
              What I found — across the Uttarakhand ranges, the Himachal passes, the Ladakh plateaus —
              was not escape. You cannot escape yourself at altitude. If anything, the mountains remove
              the usual means of avoidance. There is no scroll, no appointment, no task that can
              interrupt the simple, complete act of walking upward.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="about__text">
              What you are left with is yourself, which turns out to be enough.
            </p>
          </FadeIn>
        </section>

        <FadeIn>
          <div className="divider" />
        </FadeIn>

        {/* Philosophy */}
        <section className="about__section">
          <FadeIn>
            <div className="section-label" style={{ marginBottom: '2rem' }}>The Philosophy</div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="about__heading">
              Sunya means emptiness.<br />
              Parvat means mountain.<br />
              The empty mountain.
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="about__text">
              The name comes from the idea that the mountain is not full of anything you bring to it.
              It is not a metaphor you impose. It is not a backdrop for a photograph. It is a space
              that empties you of what you arrived with and leaves you with something more essential.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="about__text">
              Sunya Parvat is not a trekking company. We do not process bookings or optimize itineraries
              for maximum altitude gain per day. We are an orientation — a way of thinking about what it means
              to go into the mountains with your whole self, not just your fitness.
            </p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <p className="about__text">
              The journeys we describe here are real. The routes exist. The distances and altitudes are accurate.
              But we write about them the way we believe they should be approached: as experiences with interior
              dimensions, not just exterior ones.
            </p>
          </FadeIn>
        </section>

        <FadeIn>
          <div className="divider" />
        </FadeIn>

        {/* Transformation */}
        <section className="about__section">
          <FadeIn>
            <div className="section-label" style={{ marginBottom: '2rem' }}>What Actually Happens</div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="about__text">
              People who have spent significant time in the high Himalayas often say the same thing
              in different words: something changed up there. It is difficult to specify. It is not
              dramatic — you don't come back a different person in any obvious, observable way.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="about__text">
              But the things that felt important before leaving feel lighter after returning. The problems
              that felt permanent are revealed to be contextual. The urgency that governed your schedule
              is understood, for a while at least, to be a choice.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="about__text">
              The mountains don't fix anything. But they offer perspective — the word we use when we mean
              that we temporarily understood what mattered and what didn't, and then had the difficult task
              of trying to carry that understanding back into the valley.
            </p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <p className="about__text">
              Sunya Parvat exists for people who want to carry that understanding with them when they go up.
              Who want the journey to be intentional, not just athletic.
            </p>
          </FadeIn>
        </section>

        <FadeIn>
          <div className="divider" />
        </FadeIn>

        {/* Founder */}
        <section className="about__section about__founder">
          <FadeIn>
            <div className="section-label" style={{ marginBottom: '2rem' }}>The Person Behind It</div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="about__text">
              My name is Deepak Yadav. I have been going to the Indian Himalayas for over a decade.
              I have been on more than thirty treks across Uttarakhand, Himachal Pradesh, and Ladakh.
              I have made mistakes on the mountain and been humbled by them. I have also had mornings
              at altitude that I will carry with me for the rest of my life.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="about__text">
              I built Sunya Parvat because I wanted a place that wrote about the mountains the way
              the mountains actually feel — not as a checklist of summits, not as a fitness challenge,
              but as an encounter with something larger than yourself that asks you to become more
              honest about who you are.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="about__text">
              I am on Instagram at @sunya_parvat. I post slowly, when there is something worth saying.
              If something here has moved you, or if you have a question about a journey, or if you
              want to share something that happened to you on a mountain — I would like to hear it.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="about__sig">
              <span>— Deepak Yadav</span>
            </div>
          </FadeIn>
        </section>

        {/* CTA Links */}
        <FadeIn>
          <div className="about__ctas">
            <Link to="/journeys" className="about__cta-link">Explore the Journeys →</Link>
            <Link to="/connect" className="about__cta-link">Get in Touch →</Link>
            <Link to="/before-you-go" className="about__cta-link">Before You Go →</Link>
          </div>
        </FadeIn>

      </div>
    </div>
  );
}
