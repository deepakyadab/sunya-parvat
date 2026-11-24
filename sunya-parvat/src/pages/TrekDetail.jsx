import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getTrek, isLegacyId, treks } from '../data/treks';
import { getArticle } from '../data/journal';
import { difficulties, guideRules, months, editorialLabels, experienceTypes, landscapes } from '../data/taxonomy';
import { useLang } from '../i18n';
import { useAsk } from '../components/AskSunya';
import { SaveButton, CompareToggle } from '../components/TrekCard';
import TrekCard from '../components/TrekCard';
import TrekVisual, { PhotoCredit } from '../components/TrekVisual';
import Itinerary from '../components/Itinerary';
import EnquiryForm from '../components/EnquiryForm';
import Tx, { Fact, NotVerified } from '../components/Tx';
import { relatedTreks } from '../lib/catalog';
import * as fmt from '../lib/format';
import usePageMeta from '../lib/usePageMeta';
import NotFound from './NotFound';
import './TrekDetail.css';

const SECTIONS = ['overview', 'facts', 'when', 'itinerary', 'reach', 'fitness', 'gear', 'permits', 'stay', 'faq'];

function MonthStrip({ trek }) {
  const { lang, t } = useLang();
  return (
    <div className="month-strip">
      <ol className="month-strip__row">
        {months.map(m => {
          const state = trek.bestMonths.includes(m.n) ? 'best' : trek.months.includes(m.n) ? 'ok' : 'no';
          return (
            <li key={m.n} className={`month-strip__m month-strip__m--${state}`}>
              <span className="month-strip__name">{lang === 'hi' ? m.hi : m.short}</span>
              <span className="visually-hidden">: {t(`when.${state}`)}</span>
            </li>
          );
        })}
      </ol>
      <ul className="month-strip__key" aria-hidden="true">
        <li><span className="month-strip__swatch month-strip__m--best" /> {t('when.best')}</li>
        <li><span className="month-strip__swatch month-strip__m--ok" /> {t('when.ok')}</li>
        <li><span className="month-strip__swatch month-strip__m--no" /> {t('when.no')}</li>
      </ul>
    </div>
  );
}

export function TrekView({ trek, preview = false }) {
  const { lang, t, tx } = useLang();
  const { openAsk } = useAsk();
  const diff = difficulties.find(d => d.id === trek.difficulty);
  const label = trek.editorial?.label && editorialLabels[trek.editorial.label];
  const related = preview ? [] : relatedTreks(treks, trek, 3);
  const reading = trek.journal.map(getArticle).filter(Boolean);
  const v = trek.verification || {};

  const facts = [
    [t('facts.location'), fmt.location(trek, lang)],
    [t('facts.start'), trek.start ? <Tx field={trek.start} /> : null],
    [t('facts.end'), trek.end ? <Tx field={trek.end} /> : null],
    [t('facts.totalDays'), fmt.days(trek.totalDays, lang)],
    [t('facts.walkingDays'), fmt.days(trek.walkingDays, lang)],
    [t('facts.maxAltitude'), trek.maxAltitudeM != null ? <>{fmt.altitude(trek.maxAltitudeM, lang)}{trek.altitudeNote && <Tx as="small" className="fact-note" field={trek.altitudeNote} />}</> : null],
    [t('facts.distance'), fmt.km(trek.distanceKm, lang)],
    [t('facts.dailyHours'), fmt.hours(trek.dailyHours, lang)],
    [t('facts.difficulty'), diff ? <>{tx(diff)}<small className="fact-note">{tx(diff.fitness)}</small></> : null],
    [t('facts.bestTime'), fmt.monthRange(trek.bestMonths, lang, true)],
    [t('facts.restDays'), trek.restDays != null ? String(trek.restDays) : null],
    [t('facts.guide'), trek.guide ? tx(guideRules[trek.guide]) : null],
  ];

  const anchor = id => `${trek.id}-${id}`;
  const section = (id, title, children) => (
    <section id={anchor(id)} className="td-section" aria-labelledby={`${anchor(id)}-h`}>
      <h2 id={`${anchor(id)}-h`} className="td-section__title">{title}</h2>
      {children}
    </section>
  );

  return (
    <article className="td">
      <header className="td__hero">
        <TrekVisual trek={trek} tall className="td__visual" priority showScope={false} />
        <div className="td__hero-shade" />
        <div className="container td__hero-content">
          {!preview && (
            <nav aria-label={t('a11y.breadcrumb')} className="breadcrumb">
              <Link to="/treks">{t('nav.find')}</Link> <span aria-hidden="true">/</span>{' '}
              <Link to={`/treks?region=${trek.region}`}>{fmt.regionName(trek.region, lang)}</Link>
            </nav>
          )}
          {label && <p className="td__label" title={tx(trek.editorial.reason)}>{tx(label)}</p>}
          <h1 className="td__title"><Tx field={trek.name} /></h1>
          {(trek.title || trek.tagline) && <p className="td__tagline"><Tx field={trek.tagline || trek.title} /></p>}
          <p className="td__summary">
            {fmt.days(trek.totalDays, lang) || ''} · {tx(diff)} · {fmt.altitude(trek.maxAltitudeM, lang) || t('common.notVerified')} · {t('facts.best')}: {fmt.monthRange(trek.bestMonths, lang)}
          </p>
          {!preview && (
            <div className="td__actions">
              <SaveButton trek={trek} withLabel />
              <CompareToggle trek={trek} />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => openAsk(lang === 'hi' ? `${tx(trek.name)} के बारे में बताइए` : `Tell me about ${trek.name.en}`)}>
                {t('td.ask')}
              </button>
            </div>
          )}
          <div className="td__credit"><PhotoCredit trek={trek} /></div>
        </div>
      </header>

      <div className="container td__layout">
        <nav className="td__toc" aria-label={t('td.onThisPage')}>
          <p className="section-label">{t('td.onThisPage')}</p>
          <ol>
            {SECTIONS.map(s => <li key={s}><a href={`#${anchor(s)}`}>{t(`td.${s}`)}</a></li>)}
          </ol>
        </nav>

        <div className="td__main">
          {(v.localCheck || v.status !== 'verified') && (
            <aside className={`verify ${v.localCheck ? 'verify--warn' : ''}`} aria-label={t('td.verification')}>
              {v.localCheck && <p className="verify__warn"><strong>{t('td.checkLocally')}</strong> <Tx field={v.localCheck} /></p>}
              <p className="verify__status">
                {v.status === 'verified' && v.checkedOn
                  ? t('td.verifiedOn', { date: fmt.formatDate(v.checkedOn, lang) })
                  : t('td.unverified')}
              </p>
              {v.sources && v.sources.length > 0 && (
                <ul className="verify__sources">
                  {v.sources.map(s => <li key={s.url || s.label}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.label || s.url} ↗</a> : s.label}</li>)}
                </ul>
              )}
            </aside>
          )}

          {section('overview', t('td.overview'), (
            <>
              {trek.overview ? <Tx as="p" className="td__lede" field={trek.overview} /> : <Tx as="p" className="td__lede" field={trek.highlight} />}
              {trek.highlights.length > 0 && (
                <ul className="td__highlights">{trek.highlights.map((h, i) => <li key={i}><Tx field={h} /></li>)}</ul>
              )}
              <div className="td__tags">
                {trek.types.map(x => <span key={x} className="tag">{tx(experienceTypes[x])}</span>)}
                {trek.landscapes.map(x => <span key={x} className="tag tag--quiet">{tx(landscapes[x])}</span>)}
              </div>
              {(trek.suits || trek.limitations) && (
                <div className="td__fit">
                  {trek.suits && <div><h3>{t('td.suits')}</h3><Tx as="p" field={trek.suits} /></div>}
                  {trek.limitations && <div><h3>{t('td.limitations')}</h3><Tx as="p" field={trek.limitations} /></div>}
                </div>
              )}
            </>
          ))}

          {section('facts', t('td.facts'), (
            <dl className="facts-grid">
              {facts.map(([k, val]) => <div key={k}><dt>{k}</dt><dd><Fact value={val} /></dd></div>)}
            </dl>
          ))}

          {section('when', t('td.when'), (
            <>
              <MonthStrip trek={trek} />
              <p className="td__p">{t('td.whenText', { best: fmt.monthRange(trek.bestMonths, lang, true) || '—', all: fmt.monthRange(trek.months, lang, true) || '—' })}</p>
            </>
          ))}

          {section('itinerary', t('td.itinerary'), (
            <>
              <div className="duration-note">
                <p><strong>{t('td.durationIncludes')}</strong> {trek.durationNote ? <Tx field={trek.durationNote} /> : t('td.durationUnknown')}</p>
              </div>
              {trek.hasItinerary ? <Itinerary trek={trek} /> : (
                <div className="empty-state empty-state--left">
                  <p>{t('td.noItinerary')}</p>
                </div>
              )}
            </>
          ))}

          {section('reach', t('td.reach'), trek.reach ? <Tx as="p" className="td__p" field={trek.reach} /> : <p className="td__p"><NotVerified /> — {t('facts.start')}: {trek.start ? <Tx field={trek.start} /> : '—'}</p>)}

          {section('fitness', t('td.fitness'), (
            <>
              {diff && <p className="td__p">{tx(diff.fitness)}</p>}
              {trek.fitness && <Tx as="p" className="td__p" field={trek.fitness} />}
              {trek.acclimatisation && <p className="td__p"><strong>{t('td.acclimatisation')}:</strong> <Tx field={trek.acclimatisation} /></p>}
              <p className="td__p"><Link to="/journal/fitness-for-trekking" className="text-link">{t('td.fitnessLink')}</Link> · <Link to="/journal/altitude-awareness" className="text-link">{t('td.altitudeLink')}</Link></p>
            </>
          ))}

          {section('gear', t('td.gear'), (
            <>
              {trek.gear ? <Tx as="p" className="td__p" field={trek.gear} /> : <p className="td__p">{t('td.gearGeneric')}</p>}
              <p className="td__p"><Link to="/journal/packing-for-a-himalayan-trek" className="text-link">{t('td.packingLink')}</Link></p>
            </>
          ))}

          {section('permits', t('td.permits'), (
            <>
              {trek.permits ? <Tx as="p" className="td__p" field={trek.permits} /> : <p className="td__p"><NotVerified /></p>}
              <ul className="td__list">
                <li>{t('facts.guide')}: <Fact value={trek.guide ? tx(guideRules[trek.guide]) : null} /></li>
                {trek.specialPermit && <li className="warn-text">{t('td.specialPermit')}</li>}
              </ul>
              <p className="note">{t('td.permitsNote')}</p>
            </>
          ))}

          {section('stay', t('td.stay'), trek.stay ? <Tx as="p" className="td__p" field={trek.stay} /> : <p className="td__p"><NotVerified /></p>)}

          {section('faq', t('td.faq'), (
            trek.faqs.length ? (
              <div className="faq">
                {trek.faqs.map((f, i) => (
                  <details key={i} className="faq__item">
                    <summary><Tx field={f.q} /></summary>
                    <Tx as="p" field={f.a} />
                  </details>
                ))}
              </div>
            ) : <p className="td__p">{t('td.noFaq')}</p>
          ))}

          {!preview && (
            <section className="td-enquire" id={anchor('enquire')} aria-labelledby={`${anchor('enquire')}-h`}>
              <h2 id={`${anchor('enquire')}-h`} className="td-section__title">{t('td.enquireTitle')}</h2>
              <p className="td__p">{t('td.enquireText')}</p>
              <div className="td__actions" style={{ marginBottom: '1.6rem' }}>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => openAsk(lang === 'hi' ? `${tx(trek.name)} के बारे में बताइए` : `Tell me about ${trek.name.en}`)}>{t('td.ask')}</button>
              </div>
              <EnquiryForm trek={trek} idPrefix={`enq-${trek.id}`} compact />
            </section>
          )}

          {reading.length > 0 && (
            <section className="td-section">
              <h2 className="td-section__title">{t('td.reading')}</h2>
              <ul className="td__reading">
                {reading.map(a => <li key={a.id}><Link to={`/journal/${a.id}`}><Tx field={a.title} /></Link></li>)}
              </ul>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="container td-related">
          <h2 className="section-title">{t('td.related')}</h2>
          <div className="trek-grid">{related.map(r => <TrekCard key={r.id} trek={r} />)}</div>
        </section>
      )}
    </article>
  );
}

export default function TrekDetail() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const trek = getTrek(id);

  usePageMeta(trek ? {
    title: `${lang === 'hi' ? trek.name.hi || trek.name.en : trek.name.en} — ${t('td.metaSuffix')}`,
    description: `${(trek.highlight && (trek.highlight[lang] || trek.highlight.en)) || ''} ${t('td.metaFacts', { days: trek.totalDays ?? '—', alt: trek.maxAltitudeM ?? '—' })}`.trim(),
    path: `/treks/${trek.id}`,
  } : { title: t('nf.title'), noindex: true });

  if (!trek) return <NotFound />;
  if (isLegacyId(id)) return <Navigate to={`/treks/${trek.id}`} replace />;
  return <div className="page-wrapper"><TrekView trek={trek} /></div>;
}
