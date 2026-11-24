import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../i18n';
import { useAsk } from './AskSunya';
import LanguageSwitch from './LanguageSwitch';
import './Nav.css';

const navLinks = [
  { to: '/treks', key: 'nav.find' },
  { to: '/compare', key: 'nav.compare' },
  { to: '/journal', key: 'nav.journal' },
];

export default function Nav() {
  const { t } = useLang();
  const { openAsk } = useAsk();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  const solid = scrolled || location.pathname !== '/';

  return (
    <>
      <a href="#main" className="skip-link">{t('a11y.skip')}</a>
      <nav className={`nav ${solid ? 'nav--scrolled' : ''}`} aria-label={t('a11y.mainNav')}>
        <div className="nav__inner">
          <Link to="/" className="nav__logo" aria-label="Sunya Parvat — home">
            <span className="nav__logo-main">Sunya Parvat</span>
            <span className="nav__logo-sub" lang="hi">शून्य पर्वत</span>
          </Link>

          <div className="nav__links">
            {navLinks.map(({ to, key }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}>
                {t(key)}
              </NavLink>
            ))}
            <button type="button" className="nav__link nav__link--button" onClick={() => openAsk()}>
              {t('nav.ask')}
            </button>
            <LanguageSwitch />
          </div>

          <div className="nav__mobile-actions">
            <LanguageSwitch compact />
            <button
              type="button"
              className={`nav__burger ${menuOpen ? 'nav__burger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t(menuOpen ? 'a11y.closeMenu' : 'a11y.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="nav__mobile"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="nav__mobile-links">
              <Link to="/" className="nav__mobile-link nav__mobile-link--home">{t('nav.home')}</Link>
              {navLinks.map(({ to, key }) => (
                <Link key={to} to={to} className="nav__mobile-link">{t(key)}</Link>
              ))}
              <button type="button" className="nav__mobile-link nav__mobile-link--button" onClick={() => { setMenuOpen(false); openAsk(); }}>
                {t('nav.ask')}
              </button>
            </div>
            <div className="nav__mobile-footer">
              <Link to="/before-you-go" className="link-subtle">{t('nav.beforeYouGo')}</Link>
              <Link to="/about" className="link-subtle">{t('nav.about')}</Link>
              <Link to="/connect" className="link-subtle">{t('nav.connect')}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
