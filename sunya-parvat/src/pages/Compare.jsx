import React, { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { treks, getTrek } from '../data/treks';
import { difficulties, guideRules, landscapes } from '../data/taxonomy';
import { useLang } from '../i18n';
import { useSaved, MAX_COMPARE } from '../context/SavedContext';
import Tx, { Fact } from '../components/Tx';
import * as fmt from '../lib/format';
import usePageMeta from '../lib/usePageMeta';
import './Compare.css';

export default function Compare() {
  const { lang, t, tx } = useLang();
  const [params, setParams] = useSearchParams();
  const { compare, setCompareList } = useSaved();

  const urlIds = (params.get('ids') || '').split(',').filter(Boolean);
  const ids = urlIds.length ? urlIds : compare;
  const list = useMemo(() => ids.map(getTrek).filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).slice(0, MAX_COMPARE), [ids.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the URL (shareable) and the tray selection in step.
  useEffect(() => {
    const canonical = list.map(x => x.id).join(',');
    if (canonical !== (params.get('ids') || '')) setParams(canonical ? { ids: canonical } : {}, { replace: true });
    if (canonical !== compare.join(',')) setCompareList(list.map(x => x.id));
  }, [list]); // eslint-disable-line react-hooks/exhaustive-deps

  usePageMeta({
    title: list.length >= 2 ? list.map(x => x.name.en).join(' vs ') : t('cmp.metaTitle'),
    description: t('meta.compare'),
    path: '/compare',
  });

  const setIds = next => {
    setCompareList(next);
    setParams(next.length ? { ids: next.join(',') } : {}, { replace: true });
  };
  const remove = id => setIds(list.filter(x => x.id !== id).map(x => x.id));
  const add = id => { if (id) setIds([...list.map(x => x.id), id]); };

  const rows = [
    { k: t('facts.location'), f: x => fmt.location(x, lang) },
    { k: t('facts.start'), f: x => (x.start ? <Tx field={x.start} /> : null) },
    { k: t('facts.totalDays'), f: x => fmt.days(x.totalDays, lang) },
    { k: t('facts.walkingDays'), f: x => fmt.days(x.walkingDays, lang) },
    { k: t('cmp.durationIncludes'), f: x => (x.durationNote ? <Tx field={x.durationNote} /> : null), long: true },
    { k: t('facts.maxAltitude'), f: x => fmt.altitude(x.maxAltitudeM, lang) },
    { k: t('facts.distance'), f: x => fmt.km(x.distanceKm, lang) },
    { k: t('facts.dailyHours'), f: x => fmt.hours(x.dailyHours, lang) },
    { k: t('facts.difficulty'), f: x => { const d = difficulties.find(y => y.id === x.difficulty); return d ? <>{tx(d)}<small className="fact-note">{tx(d.fitness)}</small></> : null; } },
    { k: t('facts.bestTime'), f: x => fmt.monthRange(x.bestMonths, lang, true) },
    { k: t('cmp.possible'), f: x => fmt.monthRange(x.months, lang, true) },
    { k: t('cmp.acclim'), f: x => (x.acclimatisation ? <><Tx field={x.acclimatisation} />{x.restDays != null && <small className="fact-note">{t('cmp.restDays', { n: x.restDays })}</small>}</> : x.restDays != null ? t('cmp.restDays', { n: x.restDays }) : null) },
    { k: t('cmp.terrain'), f: x => (x.landscapes.length ? x.landscapes.map(l => tx(landscapes[l])).join(', ') : null) },
    { k: t('cmp.highlight'), f: x => <Tx field={x.highlight} />, long: true },
    { k: t('td.permits'), f: x => (x.permits ? <Tx field={x.permits} /> : null), long: true },
    { k: t('facts.guide'), f: x => (x.guide ? tx(guideRules[x.guide]) : null) },
    { k: t('td.suits'), f: x => (x.suits ? <Tx field={x.suits} /> : null), long: true },
    { k: t('td.limitations'), f: x => (x.limitations ? <Tx field={x.limitations} /> : null), long: true },
    { k: t('cmp.localCheck'), f: x => (x.verification?.localCheck ? <span className="warn-text"><Tx field={x.verification.localCheck} /></span> : x.specialPermit ? <span className="warn-text">{t('td.specialPermit')}</span> : t('cmp.noneFlagged')), long: true },
    { k: t('cmp.verification'), f: x => (x.verification?.status === 'verified' ? t('td.verifiedOn', { date: fmt.formatDate(x.verification.checkedOn, lang) }) : t('cmp.unverified')) },
  ];

  const available = treks.filter(x => !list.includes(x));

  return (
    <div className="page-wrapper cmp">
      <header className="page-hero page-hero--small">
        <div className="container">
          <p className="section-label">{t('nav.compare')}</p>
          <h1 className="page-title">{t('cmp.title')}</h1>
          <p className="page-subtitle">{t('cmp.subtitle', { max: MAX_COMPARE })}</p>
        </div>
      </header>

      <div className="container">
        <div className="cmp__picker">
          {list.map(x => (
            <span key={x.id} className="chip">
              {tx(x.name)}
              <button type="button" onClick={() => remove(x.id)} aria-label={t('compare.remove', { name: tx(x.name) })}>×</button>
            </span>
          ))}
          {list.length < MAX_COMPARE && (
            <>
              <label htmlFor="cmp-add" className="visually-hidden">{t('cmp.add')}</label>
              <select id="cmp-add" className="field field--sm" value="" onChange={e => add(e.target.value)}>
                <option value="">{t('cmp.add')}…</option>
                {available.map(x => <option key={x.id} value={x.id}>{tx(x.name)} — {fmt.regionName(x.region, lang)}</option>)}
              </select>
            </>
          )}
        </div>

        {list.length < 2 ? (
          <div className="empty-state">
            <p className="empty-state__title">{t('cmp.emptyTitle')}</p>
            <p>{t('cmp.emptyText')}</p>
            <div className="cmp__suggest">
              <Link className="btn btn--ghost btn--sm" to="/compare?ids=kedarkantha,brahmatal">Kedarkantha · Brahmatal</Link>
              <Link className="btn btn--ghost btn--sm" to="/compare?ids=everest-base-camp,gokyo-lakes,annapurna-base-camp">EBC · Gokyo · ABC</Link>
              <Link className="btn btn--ghost btn--sm" to="/compare?ids=kashmir-great-lakes,tarsar-marsar">KGL · Tarsar Marsar</Link>
              <Link className="btn btn--ghost btn--sm" to="/treks">{t('cmp.browse')}</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="cmp__legend">{t('cmp.legend')}</p>
            <div className="cmp__scroll" role="region" aria-label={t('cmp.tableLabel')} tabIndex={0}>
              <table className={`cmp-table cmp-table--${list.length}`}>
                <caption className="visually-hidden">{t('cmp.tableLabel')}</caption>
                <thead>
                  <tr>
                    <td />
                    {list.map(x => (
                      <th key={x.id} scope="col">
                        <Link to={`/treks/${x.id}`} className="cmp-table__name">{tx(x.name)}</Link>
                        <span className="cmp-table__region">{fmt.regionName(x.region, lang)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.k} className={r.long ? 'is-long' : ''}>
                      <th scope="row">{r.k}</th>
                      {list.map(x => (
                        <td key={x.id} data-trek={tx(x.name)}><Fact value={r.f(x)} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note cmp__note">{t('cmp.note')}</p>
          </>
        )}
      </div>
    </div>
  );
}
