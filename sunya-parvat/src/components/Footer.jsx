import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">Sunya Parvat</Link>
            <p className="footer__tagline">Into the mountains. Into the self.</p>
          </div>

          <div className="footer__nav">
            <div className="footer__nav-col">
              <span className="section-label">Explore</span>
              <Link to="/journeys">Journeys</Link>
              <Link to="/stories">Stories</Link>
              <Link to="/before-you-go">Before You Go</Link>
            </div>
            <div className="footer__nav-col">
              <span className="section-label">Connect</span>
              <Link to="/about">About</Link>
              <Link to="/connect">Contact</Link>
              <a href="https://instagram.com/sunya_parvat" target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__copy">Sunya Parvat &nbsp;·&nbsp; शून्य पर्वत</span>
          <span className="footer__deepak">— Deepak Yadav</span>
        </div>
      </div>
    </footer>
  );
}
