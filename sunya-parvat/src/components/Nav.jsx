import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Nav.css';

const navLinks = [
  { to: '/journeys', label: 'Journeys' },
  { to: '/stories', label: 'Stories' },
  { to: '/before-you-go', label: 'Before You Go' },
  { to: '/about', label: 'About' },
  { to: '/connect', label: 'Connect' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <div className="nav__inner">
          <Link to="/" className="nav__logo">
            <span className="nav__logo-main">Sunya Parvat</span>
            <span className="nav__logo-sub">शून्य पर्वत</span>
          </Link>

          <div className="nav__links">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav__link ${location.pathname === to ? 'nav__link--active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          <button
            className={`nav__burger ${menuOpen ? 'nav__burger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav__mobile"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="nav__mobile-links">
              <Link to="/" className="nav__mobile-link nav__mobile-link--home">Home</Link>
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="nav__mobile-link">{label}</Link>
              ))}
            </div>
            <div className="nav__mobile-footer">
              <span className="section-label">@sunya_parvat</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
