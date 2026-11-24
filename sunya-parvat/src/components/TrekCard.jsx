import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { useSaved } from '../context/SavedContext';
import { editorialLabels } from '../data/taxonomy';
import * as fmt from '../lib/format';
import TrekVisual from './TrekVisual';
import './TrekCard.css';

export function SaveButton({ trek, withLabel = false }) {
  const { t, tx } = useLang();
  const { isSaved, toggleSaved } = useSaved();
  const on = isSaved(trek.id);
  return (
    <button
      type="button"
      className={`icon-btn save-btn ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      aria-label={t(on ? 'card.unsave' : 'card.save', { name: tx(trek.name) })}
      onClick={() => toggleSaved(trek.id)}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"
          fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {withLabel && <span>{t(on ? 'card.saved' : 'card.saveShort')}</span>}
    </button>
  );
}

export function CompareToggle({ trek, withLabel = true }) {
  const { t, tx } = useLang();
  const { isComparing, toggleCompare } = useSaved();
  const on = isComparing(trek.id);
  return (
    <button
      type="button"
      className={`compare-toggle ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      aria-label={t(on ? 'card.uncompare' : 'card.compare', { name: tx(trek.name) })}
      onClick={() => toggleCompare(trek.id)}
    >
      <span className="compare-toggle__box" aria-hidden="true">{on ? '✓' : '+'}</span>
      {withLabel && <span>{t(on ? 'card.comparing' : 'card.compareShort')}</span>}
    </button>
  );
}

export default function TrekCard({ trek }) {
  const { lang, t, tx } = useLang();
  const label = trek.editorial?.label && editorialLabels[trek.editorial.label];
  const best = fmt.monthRange(trek.bestMonths, lang);

  return (
    <article className="tcard">
      <div className="tcard__media">
        <TrekVisual trek={trek} />
        {label && <span className="tcard__label" title={tx(trek.editorial.reason)}>{tx(label)}</span>}
        <div className="tcard__actions"><SaveButton trek={trek} /></div>
      </div>
      <div className="tcard__body">
        <p className="tcard__location">{fmt.location(trek, lang)}</p>
        <h3 className="tcard__title">
          <Link to={`/treks/${trek.id}`} className="tcard__link">{tx(trek.name)}</Link>
        </h3>
        <dl className="tcard__facts">
          <div><dt>{t('facts.duration')}</dt><dd>{fmt.days(trek.totalDays, lang) || t('common.notVerified')}</dd></div>
          <div><dt>{t('facts.difficulty')}</dt><dd>{fmt.difficultyName(trek.difficulty, lang)}</dd></div>
          <div><dt>{t('facts.bestTime')}</dt><dd>{best || t('common.notVerified')}</dd></div>
        </dl>
        <p className="tcard__highlight">{tx(trek.highlight)}</p>
        <div className="tcard__footer">
          <CompareToggle trek={trek} />
          {trek.hasItinerary
            ? <span className="tcard__badge">{t('card.fullGuide')}</span>
            : (trek.verification?.localCheck || trek.specialPermit) && <span className="tcard__badge tcard__badge--warn">{t('card.checkLocally')}</span>}
        </div>
      </div>
    </article>
  );
}
