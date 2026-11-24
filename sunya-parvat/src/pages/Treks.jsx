import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrekCard from '../components/TrekCard';
import { treks } from '../data/treks';
import { countries, regions, durationBuckets, months, seasons, difficulties, experienceTypes, landscapes } from '../data/taxonomy';
import { useLang } from '../i18n';
import { useSaved } from '../context/SavedContext';
import { applyFilters, filtersFromParams, filtersToParams, sortTreks, SORTS, activeFilterCount } from '../lib/catalog';
import usePageMeta from '../lib/usePageMeta';
import './Treks.css';

const usedCountries = Object.keys(countries).filter(c => treks.some(t => t.countries.includes(c)));

function CheckGroup({ legend, options, values, onToggle, name }) {
  return (
    <fieldset className="filter-group">
      <legend className="filter-group__legend">{legend}</legend>
      <div className="filter-group__options">
        {options.map(o => (
          <label key={o.id} className={`check ${values.includes(o.id) ? 'is-on' : ''}`}>
            <input type="checkbox" name={name} checked={values.includes(o.id)} onChange={() => onToggle(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Treks() {
  const { lang, t, tx } = useLang();
  const { saved } = useSaved();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);

  const filters = useMemo(() => filtersFromParams(params), [params]);
  const sort = SORTS.includes(params.get('sort')) ? params.get('sort') : 'recommended';

  usePageMeta({ title: t('dir.metaTitle'), description: t('meta.directory', { n: treks.length }), path: '/treks' });

  const update = (patch, nextSort = sort) => {
    const next = { ...filters, ...patch };
    if (patch.country !== undefined && patch.country !== filters.country) next.region = '';
    setParams(filtersToParams(next, nextSort), { replace: true });
  };
  const toggleIn = (key, id) => update({ [key]: filters[key].includes(id) ? filters[key].filter(x => x !== id) : [...filters[key], id] });
  const clearAll = () => setParams(sort !== 'recommended' ? { sort } : {}, { replace: true });

  const results = useMemo(() => sortTreks(applyFilters(treks, filters, saved), sort, lang), [filters, saved, sort, lang]);
  const nActive = activeFilterCount(filters);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  const regionOptions = Object.entries(regions)
    .filter(([id, r]) => (!filters.country || r.country === filters.country || treks.some(x => x.region === id && x.countries.includes(filters.country))) && treks.some(x => x.region === id));

  // Removable chips for every active filter
  const chips = [];
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, clear: () => update({ q: '' }) });
  if (filters.country) chips.push({ key: 'country', label: tx(countries[filters.country]), clear: () => update({ country: '' }) });
  if (filters.region) chips.push({ key: 'region', label: tx(regions[filters.region]), clear: () => update({ region: '' }) });
  if (filters.duration) chips.push({ key: 'duration', label: tx(durationBuckets.find(b => b.id === filters.duration)), clear: () => update({ duration: '' }) });
  if (filters.month) chips.push({ key: 'month', label: tx(months[Number(filters.month) - 1]), clear: () => update({ month: '' }) });
  if (filters.season) chips.push({ key: 'season', label: tx(seasons.find(s => s.id === filters.season)), clear: () => update({ season: '' }) });
  filters.difficulty.forEach(d => chips.push({ key: `d-${d}`, label: tx(difficulties.find(x => x.id === d)), clear: () => toggleIn('difficulty', d) }));
  filters.type.forEach(d => chips.push({ key: `t-${d}`, label: tx(experienceTypes[d]), clear: () => toggleIn('type', d) }));
  filters.landscape.forEach(d => chips.push({ key: `l-${d}`, label: tx(landscapes[d]), clear: () => toggleIn('landscape', d) }));
  if (filters.saved) chips.push({ key: 'saved', label: t('dir.savedOnly'), clear: () => update({ saved: false }) });

  const renderPanel = px => (
    <div className="filters">
      <div className="filter-group">
        <label className="filter-group__legend" htmlFor={`${px}-country`}>{t('dir.country')}</label>
        <select id={`${px}-country`} className="field" value={filters.country} onChange={e => update({ country: e.target.value })}>
          <option value="">{t('dir.anyCountry')}</option>
          {usedCountries.map(c => <option key={c} value={c}>{tx(countries[c])}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label className="filter-group__legend" htmlFor={`${px}-region`}>{t('dir.region')}</label>
        <select id={`${px}-region`} className="field" value={filters.region} onChange={e => update({ region: e.target.value })}>
          <option value="">{t('dir.anyRegion')}</option>
          {regionOptions.map(([id, r]) => <option key={id} value={id}>{tx(r)}</option>)}
        </select>
      </div>
      <fieldset className="filter-group">
        <legend className="filter-group__legend">{t('dir.duration')}</legend>
        <div className="pill-row">
          {durationBuckets.map(b => (
            <button key={b.id} type="button" className={`pill ${filters.duration === b.id ? 'is-on' : ''}`} aria-pressed={filters.duration === b.id}
              onClick={() => update({ duration: filters.duration === b.id ? '' : b.id })}>{tx(b)}</button>
          ))}
        </div>
      </fieldset>
      <div className="filter-group">
        <label className="filter-group__legend" htmlFor={`${px}-month`}>{t('dir.month')}</label>
        <select id={`${px}-month`} className="field" value={filters.month} onChange={e => update({ month: e.target.value })}>
          <option value="">{t('dir.anyMonth')}</option>
          {months.map(m => <option key={m.n} value={m.n}>{tx(m)}</option>)}
        </select>
      </div>
      <fieldset className="filter-group">
        <legend className="filter-group__legend">{t('dir.season')}</legend>
        <div className="pill-row">
          {seasons.map(s => (
            <button key={s.id} type="button" className={`pill ${filters.season === s.id ? 'is-on' : ''}`} aria-pressed={filters.season === s.id}
              onClick={() => update({ season: filters.season === s.id ? '' : s.id })}>{tx(s)}</button>
          ))}
        </div>
      </fieldset>
      <CheckGroup name="difficulty" legend={t('dir.difficulty')} values={filters.difficulty} onToggle={id => toggleIn('difficulty', id)}
        options={difficulties.map(d => ({ id: d.id, label: tx(d) }))} />
      <CheckGroup name="type" legend={t('dir.type')} values={filters.type} onToggle={id => toggleIn('type', id)}
        options={Object.entries(experienceTypes).map(([id, v]) => ({ id, label: tx(v) }))} />
      <CheckGroup name="landscape" legend={t('dir.landscape')} values={filters.landscape} onToggle={id => toggleIn('landscape', id)}
        options={Object.entries(landscapes).map(([id, v]) => ({ id, label: tx(v) }))} />
    </div>
  );

  return (
    <div className="page-wrapper dir">
      <header className="page-hero page-hero--small">
        <div className="container">
          <p className="section-label">{t('nav.find')}</p>
          <h1 className="page-title">{t('dir.title')}</h1>
          <p className="page-subtitle">{t('dir.subtitle', { n: treks.length })}</p>
        </div>
      </header>

      <div className="container dir__layout">
        <aside className="dir__sidebar" aria-label={t('dir.filters')}>{!drawer && renderPanel('side')}</aside>

        <div className="dir__main">
          <div className="dir__toolbar">
            <div className="dir__search">
              <label htmlFor="dir-search" className="visually-hidden">{t('dir.search')}</label>
              <input id="dir-search" type="search" className="field" placeholder={t('dir.searchPlaceholder')}
                value={filters.q} onChange={e => update({ q: e.target.value })} />
            </div>
            <div className="dir__controls">
              <button type="button" className="btn btn--sm btn--ghost dir__filters-btn" onClick={() => setDrawer(true)} aria-haspopup="dialog">
                {t('dir.filters')}{nActive ? ` (${nActive})` : ''}
              </button>
              <button type="button" className={`pill ${filters.saved ? 'is-on' : ''}`} aria-pressed={filters.saved} onClick={() => update({ saved: !filters.saved })}>
                ♥ {t('dir.saved', { n: saved.length })}
              </button>
              <label htmlFor="dir-sort" className="visually-hidden">{t('dir.sortLabel')}</label>
              <select id="dir-sort" className="field field--sm" value={sort} onChange={e => update({}, e.target.value)}>
                {SORTS.map(s => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
              </select>
            </div>
          </div>

          <div className="dir__status">
            <p role="status" aria-live="polite" className="dir__count">
              {t('dir.count', { n: results.length, total: treks.length })}
            </p>
            {chips.length > 0 && (
              <ul className="chips" aria-label={t('dir.activeFilters')}>
                {chips.map(c => (
                  <li key={c.key}>
                    <button type="button" className="chip" onClick={c.clear} aria-label={t('dir.removeFilter', { name: c.label })}>
                      {c.label} <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
                <li><button type="button" className="btn-text" onClick={clearAll}>{t('dir.clearAll')}</button></li>
              </ul>
            )}
          </div>

          {results.length ? (
            <div className="trek-grid">
              {results.map(trek => <TrekCard key={trek.id} trek={trek} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state__title">{filters.saved && !saved.length ? t('dir.emptySaved') : t('dir.empty')}</p>
              <p>{t('dir.emptyHint')}</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>{t('dir.clearAll')}</button>
            </div>
          )}

          <p className="dir__catalog-note">{t('dir.catalogNote')}</p>
        </div>
      </div>

      {drawer && (
        <div className="drawer" role="dialog" aria-modal="true" aria-label={t('dir.filters')}
          onKeyDown={e => { if (e.key === 'Escape') setDrawer(false); }}>
          <div className="drawer__backdrop" onClick={() => setDrawer(false)} />
          <div className="drawer__panel">
            <div className="drawer__head">
              <h2>{t('dir.filters')}</h2>
              <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label={t('common.close')} autoFocus>×</button>
            </div>
            <div className="drawer__body">{renderPanel('drawer')}</div>
            <div className="drawer__foot">
              <button type="button" className="btn-text" onClick={clearAll}>{t('dir.clearAll')}</button>
              <button type="button" className="btn btn--primary" onClick={() => setDrawer(false)}>{t('dir.showN', { n: results.length })}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
