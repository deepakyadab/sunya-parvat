import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import usePageMeta from '../lib/usePageMeta';
import './NotFound.css';

export default function NotFound() {
  const { t } = useLang();
  usePageMeta({ title: t('nf.title'), noindex: true });
  return (
    <div className="notfound">
      <div className="notfound__content">
        <div className="section-label" style={{ marginBottom: '2rem' }}>{t('nf.eyebrow')}</div>
        <h1 className="notfound__title">{t('nf.title')}</h1>
        <p className="notfound__text">{t('nf.text')}</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/treks" className="notfound__link">{t('nav.find')} →</Link>
          <Link to="/" className="notfound__link">{t('nf.home')} →</Link>
        </div>
      </div>
    </div>
  );
}
