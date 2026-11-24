import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { treks } from '../data/treks';
import { months, landscapes } from '../data/taxonomy';
import { matchTreks, DAY_OPTIONS, EXPERIENCE_OPTIONS } from '../lib/matcher';
import * as fmt from '../lib/format';
import { SaveButton, CompareToggle } from './TrekCard';
import './FindMyTrek.css';

const LANDSCAPE_CHOICES = ['meadow', 'lake', 'summit', 'pass', 'forest', 'glacier', 'ridge', 'village'];

function Choice({ name, value, current, onChange, children }) {
  const id = `${name}-${value}`;
  return (
    <label htmlFor={id} className={`fmt-choice ${current === value ? 'is-on' : ''}`}>
      <input type="radio" id={id} name={name} value={value} checked={current === value} onChange={() => onChange(value)} />
      <span>{children}</span>
    </label>
  );
}

export default function FindMyTrek({ id = 'find-my-trek' }) {
  const { lang, t, tx } = useLang();
  const [a, setA] = useState({ month: '', days: '', experience: '', landscape: '' });
  const [results, setResults] = useState(null);
  const resultsRef = useRef(null);
  const set = key => value => setA(prev => ({ ...prev, [key]: value }));

  const ready = a.month && a.days && a.experience;

  const submit = e => {
    e.preventDefault();
    if (!ready) return;
    setResults(matchTreks(treks, a, lang, 3));
    setTimeout(() => resultsRef.current && resultsRef.current.focus(), 50);
  };

  const reset = () => { setA({ month: '', days: '', experience: '', landscape: '' }); setResults(null); };

  return (
    <section className="fmt" id={id} aria-labelledby={`${id}-title`}>
      <div className="fmt__head">
        <p className="section-label">{t('guide.eyebrow')}</p>
        <h2 id={`${id}-title`} className="fmt__title">{t('guide.title')}</h2>
        <p className="fmt__intro">{t('guide.intro')}</p>
      </div>

      <form className="fmt__form" onSubmit={submit}>
        <fieldset className="fmt__q">
          <legend><span className="fmt__num">1</span>{t('guide.qMonth')}</legend>
          <select className="field" value={a.month} onChange={e => set('month')(e.target.value)} aria-label={t('guide.qMonth')}>
            <option value="">{t('guide.chooseMonth')}</option>
            {months.map(m => <option key={m.n} value={m.n}>{tx(m)}</option>)}
          </select>
        </fieldset>

        <fieldset className="fmt__q">
          <legend><span className="fmt__num">2</span>{t('guide.qDays')}</legend>
          <div className="fmt__choices">
            {DAY_OPTIONS.map(o => <Choice key={o.id} name={`${id}-days`} value={o.id} current={a.days} onChange={set('days')}>{tx(o)}</Choice>)}
          </div>
        </fieldset>

        <fieldset className="fmt__q">
          <legend><span className="fmt__num">3</span>{t('guide.qExperience')}</legend>
          <div className="fmt__choices">
            {EXPERIENCE_OPTIONS.map(o => <Choice key={o.id} name={`${id}-exp`} value={o.id} current={a.experience} onChange={set('experience')}>{tx(o)}</Choice>)}
          </div>
        </fieldset>

        <fieldset className="fmt__q">
          <legend><span className="fmt__num">4</span>{t('guide.qLandscape')} <span className="fmt__optional">{t('common.optional')}</span></legend>
          <div className="fmt__choices">
            <Choice name={`${id}-land`} value="" current={a.landscape} onChange={set('landscape')}>{t('guide.anyLandscape')}</Choice>
            {LANDSCAPE_CHOICES.map(l => <Choice key={l} name={`${id}-land`} value={l} current={a.landscape} onChange={set('landscape')}>{tx(landscapes[l])}</Choice>)}
          </div>
        </fieldset>

        <div className="fmt__submit">
          <button type="submit" className="btn btn--primary" disabled={!ready}>{t('guide.submit')}</button>
          {!ready && <span className="fmt__hint">{t('guide.needThree')}</span>}
          {results && <button type="button" className="btn-text" onClick={reset}>{t('guide.startOver')}</button>}
        </div>
      </form>

      {results && (
        <div className="fmt__results" ref={resultsRef} tabIndex={-1} aria-live="polite">
          {results.length === 0 ? (
            <div className="empty-state">
              <p>{t('guide.none')}</p>
              <Link to="/treks" className="link-subtle">{t('guide.browseAll')} →</Link>
            </div>
          ) : (
            <>
              <p className="fmt__results-title">{t('guide.results', { n: results.length })}</p>
              <ol className="fmt__list">
                {results.map(({ trek, reasons, notes }) => (
                  <li key={trek.id} className="fmt__result">
                    <div className="fmt__result-head">
                      <div>
                        <p className="tcard__location">{fmt.location(trek, lang)}</p>
                        <h3 className="fmt__result-name"><Link to={`/treks/${trek.id}`}>{tx(trek.name)}</Link></h3>
                        <p className="fmt__result-facts">
                          {fmt.days(trek.totalDays, lang)} · {fmt.difficultyName(trek.difficulty, lang)} · {fmt.altitude(trek.maxAltitudeM, lang) || t('common.notVerified')}
                        </p>
                      </div>
                      <SaveButton trek={trek} />
                    </div>
                    <p className="fmt__why-label">{t('guide.why')}</p>
                    <ul className="fmt__why">{reasons.map(r => <li key={r}>{r}</li>)}</ul>
                    {notes.map(n => <p key={n} className="note note--warn">{n}</p>)}
                    <div className="fmt__result-actions">
                      <Link to={`/treks/${trek.id}`} className="link-subtle">{t('guide.viewTrek')} →</Link>
                      <CompareToggle trek={trek} />
                    </div>
                  </li>
                ))}
              </ol>
              <p className="fmt__foot">{t('guide.disclaimer')}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
