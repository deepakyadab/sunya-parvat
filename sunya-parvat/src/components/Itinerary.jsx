import React from 'react';
import { useLang } from '../i18n';
import { dayKinds } from '../data/taxonomy';
import * as fmt from '../lib/format';
import Tx from './Tx';
import './Itinerary.css';

export default function Itinerary({ trek }) {
  const { lang, t } = useLang();
  const kindsUsed = [...new Set(trek.itinerary.map(d => d.kind || 'trek'))];

  return (
    <div className="itin">
      <ul className="itin__legend" aria-label={t('itin.legend')}>
        {kindsUsed.map(k => (
          <li key={k}><span className={`itin__kind itin__kind--${k}`}>{dayKinds[k] ? (lang === 'hi' ? dayKinds[k].hi : dayKinds[k].en) : k}</span></li>
        ))}
      </ul>

      <ol className="itin__list">
        {trek.itinerary.map(d => {
          const kind = d.kind || 'trek';
          const stats = [
            d.distanceKm != null && { k: t('itin.distance'), v: fmt.km(d.distanceKm, lang) },
            (d.ascentM != null || d.descentM != null) && {
              k: t('itin.elevation'),
              v: [d.ascentM != null && `↑ ${fmt.altitude(d.ascentM, lang)}`, d.descentM != null && `↓ ${fmt.altitude(d.descentM, lang)}`].filter(Boolean).join('  '),
            },
            d.hours && { k: t('itin.hours'), v: fmt.hours(d.hours, lang) },
            d.altitudeM != null && { k: t('itin.altitude'), v: fmt.altitude(d.altitudeM, lang) },
            d.overnight && { k: t('itin.overnight'), v: <Tx field={d.overnight} /> },
            d.meals && { k: t('itin.meals'), v: <Tx field={d.meals} /> },
          ].filter(Boolean);

          return (
            <li key={d.day} className={`itin__day itin__day--${kind}`}>
              <div className="itin__marker" aria-hidden="true">
                <span className="itin__num">{d.day}</span>
              </div>
              <div className="itin__content">
                <p className="itin__daylabel">
                  {t('itin.day', { n: d.day })}
                  <span className={`itin__kind itin__kind--${kind}`}>{dayKinds[kind] ? (lang === 'hi' ? dayKinds[kind].hi : dayKinds[kind].en) : kind}</span>
                </p>
                <h3 className="itin__route"><Tx field={d.route} /></h3>
                {d.description && <Tx as="p" className="itin__desc" field={d.description} />}
                {stats.length > 0 && (
                  <dl className="itin__stats">
                    {stats.map(s => <div key={s.k}><dt>{s.k}</dt><dd>{s.v}</dd></div>)}
                  </dl>
                )}
                {d.notes && <Tx as="p" className="note note--warn" field={d.notes} />}
                {d.reflection && (
                  <details className="itin__reflection">
                    <summary>{t('itin.reflection')}</summary>
                    <Tx as="p" field={d.reflection} />
                  </details>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
