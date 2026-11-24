import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import './Footer.css';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">Sunya Parvat</Link>
            <p className="footer__tagline">{t('footer.tagline')}</p>
          </div>

          <div className="footer__nav">
            <div className="footer__nav-col">
              <span className="section-label">{t('footer.explore')}</span>
              <Link to="/treks">{t('nav.find')}</Link>
              <Link to="/compare">{t('nav.compare')}</Link>
              <Link to="/journal">{t('nav.journal')}</Link>
              <Link to="/before-you-go">{t('nav.beforeYouGo')}</Link>
            </div>
            <div className="footer__nav-col">
              <span className="section-label">{t('footer.connect')}</span>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/connect">{t('nav.connect')}</Link>
              <a href="https://instagram.com/sunya_parvat" target="_blank" rel="noreferrer">Instagram ↗</a>
            </div>
          </div>
        </div>

        <p className="footer__note">{t('footer.note')}</p>

        <div className="footer__bottom">
          <span className="footer__copy">Sunya Parvat &nbsp;·&nbsp; <span lang="hi">शून्य पर्वत</span></span>
          <span className="footer__deepak">— Deepak Yadav</span>
        </div>
      </div>
    </footer>
  );
}
