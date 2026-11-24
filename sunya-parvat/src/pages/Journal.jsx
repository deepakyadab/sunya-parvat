import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { articles } from '../data/journal';
import { useLang } from '../i18n';
import Tx from '../components/Tx';
import usePageMeta from '../lib/usePageMeta';
import * as fmt from '../lib/format';
import './Journal.css';

export default function Journal() {
  const { lang, t } = useLang();
  const [kind, setKind] = useState('all');
  const [inMyLang, setInMyLang] = useState(false);

  usePageMeta({ title: t('nav.journal'), description: t('meta.journal'), path: '/journal' });

  const list = articles
    .filter(a => kind === 'all' || a.kind === kind)
    .filter(a => !inMyLang || a.languages.includes(lang));

  return (
    <div className="page-wrapper journal">
      <header className="page-hero page-hero--small">
        <div className="container">
          <p className="section-label">{t('nav.journal')}</p>
          <h1 className="page-title">{t('journal.title')}</h1>
          <p className="page-subtitle">{t('journal.subtitle')}</p>
        </div>
      </header>

      <div className="container">
        <div className="journal__filters">
          {['all', 'guide', 'reflection'].map(k => (
            <button key={k} type="button" className={`pill ${kind === k ? 'is-on' : ''}`} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {t(`journal.kind.${k}`)}
            </button>
          ))}
          {lang === 'hi' && (
            <label className="check">
              <input type="checkbox" checked={inMyLang} onChange={e => setInMyLang(e.target.checked)} />
              <span>{t('journal.hindiOnly')}</span>
            </label>
          )}
        </div>

        <div className="journal__list">
          {list.map(a => (
            <Link key={a.id} to={`/journal/${a.id}`} className="jrow">
              <div className="jrow__meta">
                <span className="tag tag--quiet">{t(`journal.kind.${a.kind}`)}</span>
                <span className="jrow__langs">{a.languages.map(l => (l === 'hi' ? 'हिंदी' : 'English')).join(' · ')}</span>
                <span>{t('journal.minutes', { n: a.readTime })}</span>
              </div>
              <h2 className="jrow__title"><Tx field={a.title} /></h2>
              <Tx as="p" className="jrow__summary" field={a.summary} />
              {a.relatedTreks.length > 0 && <p className="jrow__treks">{t('journal.relatedCount', { n: a.relatedTreks.length })}</p>}
              <span className="visually-hidden">{fmt.formatDate(a.date, lang)}</span>
            </Link>
          ))}
          {!list.length && <div className="empty-state"><p>{t('journal.empty')}</p></div>}
        </div>
      </div>
    </div>
  );
}
