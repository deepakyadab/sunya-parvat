import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticle } from '../data/journal';
import { getTrek } from '../data/treks';
import { useLang } from '../i18n';
import TrekCard from '../components/TrekCard';
import usePageMeta from '../lib/usePageMeta';
import * as fmt from '../lib/format';
import NotFound from './NotFound';
import './Journal.css';

/* Minimal block renderer: "## " headings, "- " bullet lists, paragraphs. */
function Body({ text }) {
  const blocks = String(text || '').trim().split(/\n\s*\n/);
  const out = [];
  blocks.forEach((b, i) => {
    const lines = b.split('\n');
    let buf = [];
    const flushList = key => { if (buf.length) { out.push(<ul key={key}>{buf.map((l, j) => <li key={j}>{l}</li>)}</ul>); buf = []; } };
    lines.forEach((line, j) => {
      const l = line.trim();
      if (l.startsWith('## ')) { flushList(`${i}-${j}-ul`); out.push(<h2 key={`${i}-${j}`}>{l.slice(3)}</h2>); }
      else if (l.startsWith('- ')) buf.push(l.slice(2));
      else if (l) { flushList(`${i}-${j}-ul`); out.push(<p key={`${i}-${j}`}>{l}</p>); }
    });
    flushList(`${i}-end`);
  });
  return <div className="article__body">{out}</div>;
}

export default function Article() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const a = getArticle(id);

  const showLang = a && a.languages.includes(lang) ? lang : 'en';
  usePageMeta(a ? {
    title: a.title[showLang] || a.title.en,
    description: a.summary[showLang] || a.summary.en,
    path: `/journal/${a.id}`,
  } : { title: t('nf.title'), noindex: true });

  if (!a) return <NotFound />;
  const treks = a.relatedTreks.map(getTrek).filter(Boolean);
  const translated = showLang === lang;

  return (
    <div className="page-wrapper article">
      <header className="article__header container--narrow">
        <Link to="/journal" className="link-subtle">← {t('nav.journal')}</Link>
        <div className="article__meta">
          <span className="tag tag--quiet">{t(`journal.kind.${a.kind}`)}</span>
          <span>{fmt.formatDate(a.date, lang)}</span>
          <span>{t('journal.minutes', { n: a.readTime })}</span>
          <span>{t('journal.availableIn')}: {a.languages.map(l => (l === 'hi' ? 'हिंदी' : 'English')).join(', ')}</span>
        </div>
        <h1 className="article__title" lang={showLang}>{a.title[showLang]}</h1>
        {a.subtitle && <p className="article__subtitle" lang={showLang}>{a.subtitle[showLang] || a.subtitle.en}</p>}
        {!translated && <p className="note">{t('journal.notTranslated')}</p>}
        {showLang === 'hi' && a.hiReviewed === false && a.safety && <p className="note note--warn">{t('journal.hiReviewPending')}</p>}
      </header>

      <div className="container--narrow" lang={showLang}>
        <p className="article__lede">{a.summary[showLang]}</p>
        <Body text={a.body[showLang]} />
        {a.kind === 'reflection' && <p className="article__sig">— Deepak Yadav</p>}
      </div>

      {treks.length > 0 && (
        <section className="container article__treks">
          <h2 className="section-title">{t('journal.relatedTreks')}</h2>
          <div className="trek-grid">{treks.map(tr => <TrekCard key={tr.id} trek={tr} />)}</div>
        </section>
      )}
    </div>
  );
}
