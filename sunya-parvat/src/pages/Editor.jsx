/*
  Itinerary & trek editor — DEVELOPMENT ONLY.

  This route is compiled only into `npm start` builds (see App.jsx); production
  builds on Vercel do not contain it, so ordinary visitors never see editing
  controls. "Publish" sends the trek to scripts/editor-server.js, which runs on
  the owner's own machine (127.0.0.1) and writes the JSON file in
  src/data/treks. The owner then reviews the diff, commits and pushes, and
  Vercel redeploys. Drafts are kept in this browser's localStorage.
*/
import React, { useEffect, useMemo, useState } from 'react';
import { allTreks, normalise } from '../data/treks';
import { countries, regions, difficulties, experienceTypes, landscapes, months, dayKinds, guideRules, editorialLabels } from '../data/taxonomy';
import { useLang } from '../i18n';
import { storage } from '../lib/storage';
import { TrekView } from './TrekDetail';
import LanguageSwitch from '../components/LanguageSwitch';
import './Editor.css';

const SERVER = 'http://127.0.0.1:4321';
const DERIVED = ['seasons', 'bestSeasons', 'hasItinerary', '_file', '_hay'];

const blankTrek = () => ({
  id: '', status: 'draft', name: { en: '', hi: '' }, countries: ['india'], region: 'uttarakhand',
  start: { en: '', hi: '' }, totalDays: null, walkingDays: null, maxAltitudeM: null, distanceKm: null, dailyHours: '',
  difficulty: 'moderate', months: [], bestMonths: [], guide: 'recommended', types: [], landscapes: [],
  highlight: { en: '', hi: '' }, itinerary: [], verification: { status: 'unverified', checkedOn: null, sources: [] },
});

const blankDay = n => ({ day: n, kind: 'trek', route: { en: '', hi: '' }, description: { en: '', hi: '' } });

function strip(t) {
  const c = JSON.parse(JSON.stringify(t));
  DERIVED.forEach(k => delete c[k]);
  return c;
}

/* Remove empty strings / empty bilingual objects so JSON stays clean. */
function tidy(v) {
  if (Array.isArray(v)) return v.map(tidy);
  if (v && typeof v === 'object') {
    const out = {};
    Object.entries(v).forEach(([k, val]) => {
      const tv = tidy(val);
      if (tv === '' || tv === undefined) return;
      if (tv && typeof tv === 'object' && !Array.isArray(tv) && Object.keys(tv).length === 0) return;
      out[k] = tv;
    });
    return out;
  }
  return v;
}

function Bi({ label, value, onChange, area = false, hint }) {
  const v = value || { en: '', hi: '' };
  const Input = area ? 'textarea' : 'input';
  return (
    <div className="ed-field ed-field--bi">
      <span className="ed-label">{label}{hint && <small> — {hint}</small>}</span>
      <div className="ed-bi">
        <label><span>EN</span><Input className="field" rows={area ? 3 : undefined} value={v.en || ''} onChange={e => onChange({ ...v, en: e.target.value })} /></label>
        <label><span>हिं</span><Input className="field" lang="hi" rows={area ? 3 : undefined} value={v.hi || ''} onChange={e => onChange({ ...v, hi: e.target.value })} /></label>
      </div>
    </div>
  );
}

function Num({ label, value, onChange }) {
  return (
    <label className="ed-field">
      <span className="ed-label">{label}</span>
      <input className="field" type="number" value={value ?? ''} onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))} />
    </label>
  );
}

function Multi({ label, options, values, onChange }) {
  return (
    <fieldset className="ed-field">
      <legend className="ed-label">{label}</legend>
      <div className="ed-multi">
        {options.map(([id, l]) => (
          <label key={id} className="check">
            <input type="checkbox" checked={values.includes(id)} onChange={() => onChange(values.includes(id) ? values.filter(x => x !== id) : [...values, id])} />
            <span>{l}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function Editor() {
  const { lang } = useLang();
  const [drafts, setDrafts] = useState(() => storage.getJSON('sp.editor.drafts', {}));
  const [current, setCurrent] = useState(null);
  const [mode, setMode] = useState('edit');
  const [msg, setMsg] = useState(null);
  const [server, setServer] = useState('unknown');

  useEffect(() => {
    document.title = 'Editor · Sunya Parvat';
    fetch(`${SERVER}/health`).then(r => setServer(r.ok ? 'up' : 'down')).catch(() => setServer('down'));
  }, []);

  useEffect(() => storage.setJSON('sp.editor.drafts', drafts), [drafts]);

  const list = useMemo(() => {
    const ids = new Set(allTreks.map(t => t.id));
    const local = Object.values(drafts).filter(d => !ids.has(d.id));
    return [...allTreks.map(t => ({ id: t.id, name: t.name, status: t.status, hasDraft: !!drafts[t.id], days: t.itinerary.length })), ...local.map(d => ({ id: d.id, name: d.name, status: 'local draft', hasDraft: true, days: (d.itinerary || []).length }))];
  }, [drafts]);

  const open = id => {
    const base = drafts[id] || strip(allTreks.find(t => t.id === id) || {});
    setCurrent(JSON.parse(JSON.stringify(base)));
    setMode('edit');
    setMsg(null);
  };

  const set = (key, val) => setCurrent(c => ({ ...c, [key]: val }));
  const setDay = (i, key, val) => setCurrent(c => ({ ...c, itinerary: c.itinerary.map((d, j) => (j === i ? { ...d, [key]: val } : d)) }));
  const renumber = arr => arr.map((d, i) => ({ ...d, day: i + 1 }));
  const moveDay = (i, dir) => setCurrent(c => {
    const arr = [...c.itinerary];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return c;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...c, itinerary: renumber(arr) };
  });
  const addDay = () => setCurrent(c => ({ ...c, itinerary: [...(c.itinerary || []), blankDay((c.itinerary || []).length + 1)] }));
  const removeDay = i => setCurrent(c => ({ ...c, itinerary: renumber(c.itinerary.filter((_, j) => j !== i)) }));

  const problems = useMemo(() => {
    if (!current) return [];
    const p = [];
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(current.id || '')) p.push('Id must be lowercase words joined by hyphens, e.g. "kuari-pass".');
    if (!current.name?.en) p.push('English name is required.');
    if (!current.months?.length) p.push('Choose at least one month when the trek is done.');
    if ((current.bestMonths || []).some(m => !current.months.includes(m))) p.push('Every best month must also be a trekking month.');
    if (current.walkingDays != null && current.totalDays != null && current.walkingDays > current.totalDays) p.push('Walking days cannot exceed total days.');
    (current.itinerary || []).forEach(d => { if (!d.route?.en) p.push(`Day ${d.day} needs an English route.`); });
    if (current.verification?.status === 'verified' && !current.verification?.checkedOn) p.push('A verified trek needs a "last checked" date.');
    return p;
  }, [current]);

  const saveDraft = () => {
    const clean = tidy(current);
    setDrafts(d => ({ ...d, [clean.id]: clean }));
    setMsg({ ok: true, text: 'Draft saved in this browser. It is not on the website yet.' });
  };

  const publish = async status => {
    if (problems.length) { setMsg({ ok: false, text: 'Fix the problems listed above first.' }); return; }
    const clean = tidy({ ...current, status });
    try {
      const r = await fetch(`${SERVER}/treks/${clean.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clean) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      setDrafts(d => { const n = { ...d }; delete n[clean.id]; return n; });
      setMsg({ ok: true, text: `Written to src/data/treks/${j.file} as "${status}". Review the change with git, then commit and push to deploy.` });
    } catch (e) {
      setMsg({ ok: false, text: `Could not reach the local editor server (${e.message}). Start it with "npm run editor-server", or download the JSON and add it to src/data/treks yourself.` });
    }
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(tidy(current), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${current.id || 'trek'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!current) {
    return (
      <div className="page-wrapper editor container">
        <div className="ed-banner">Development-only editor. It is not included in the public site build. Local server: <strong>{server}</strong>.</div>
        <div className="ed-head">
          <h1 className="page-title">Trek editor</h1>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => { setCurrent(blankTrek()); setMode('edit'); }}>New trek</button>
        </div>
        <table className="ed-table">
          <thead><tr><th>Trek</th><th>Status</th><th>Itinerary days</th><th /></tr></thead>
          <tbody>
            {list.map(t => (
              <tr key={t.id}>
                <td>{t.name?.en || t.id} <small>{t.id}</small></td>
                <td>{t.status}{t.hasDraft ? ' · unsaved draft' : ''}</td>
                <td>{t.days || '—'}</td>
                <td><button type="button" className="btn-text" onClick={() => open(t.id)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const c = current;
  let previewTrek = null;
  try { previewTrek = normalise({ ...tidy(c), name: c.name?.en ? c.name : { en: c.id || 'Untitled' } }, 'preview'); } catch (e) { previewTrek = null; }

  return (
    <div className="page-wrapper editor">
      <div className="ed-toolbar">
        <div className="container ed-toolbar__inner">
          <button type="button" className="btn-text" onClick={() => setCurrent(null)}>← All treks</button>
          <strong>{c.name?.en || 'New trek'}</strong>
          <div className="ed-toolbar__actions">
            <button type="button" className={`pill ${mode === 'edit' ? 'is-on' : ''}`} onClick={() => setMode('edit')}>Edit</button>
            <button type="button" className={`pill ${mode === 'preview' ? 'is-on' : ''}`} onClick={() => setMode('preview')}>Preview</button>
            {mode === 'preview' && <LanguageSwitch compact />}
            <button type="button" className="btn btn--ghost btn--sm" onClick={saveDraft}>Save draft</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => publish('draft')} disabled={server !== 'up'}>Write as draft</button>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => publish('published')} disabled={server !== 'up'}>Publish</button>
            <button type="button" className="btn-text" onClick={download}>Download JSON</button>
          </div>
        </div>
      </div>

      <div className="container">
        {server !== 'up' && <p className="ed-banner">Local editor server is not running, so Publish is disabled. Run <code>npm run editor-server</code> in a second terminal, then reload.</p>}
        {msg && <p className={`ed-msg ${msg.ok ? 'is-ok' : 'is-err'}`} role="status">{msg.text}</p>}
        {problems.length > 0 && <ul className="ed-problems">{problems.map(p => <li key={p}>{p}</li>)}</ul>}

        {mode === 'preview' ? (
          previewTrek ? <div className="ed-preview" lang={lang}><TrekView trek={previewTrek} preview /></div> : <p>Preview unavailable.</p>
        ) : (
          <form className="ed-form" onSubmit={e => e.preventDefault()}>
            <section className="ed-section">
              <h2>Basics</h2>
              <div className="ed-grid">
                <label className="ed-field"><span className="ed-label">Id (URL)</span><input className="field" value={c.id} onChange={e => set('id', e.target.value.trim().toLowerCase())} /></label>
                <label className="ed-field"><span className="ed-label">Region</span>
                  <select className="field" value={c.region} onChange={e => set('region', e.target.value)}>{Object.entries(regions).map(([id, r]) => <option key={id} value={id}>{r.en}</option>)}</select></label>
                <label className="ed-field"><span className="ed-label">Difficulty</span>
                  <select className="field" value={c.difficulty} onChange={e => set('difficulty', e.target.value)}>{difficulties.map(d => <option key={d.id} value={d.id}>{d.en}</option>)}</select></label>
                <label className="ed-field"><span className="ed-label">Guide</span>
                  <select className="field" value={c.guide || ''} onChange={e => set('guide', e.target.value || null)}><option value="">Unknown</option>{Object.entries(guideRules).map(([id, g]) => <option key={id} value={id}>{g.en}</option>)}</select></label>
              </div>
              <Bi label="Name" value={c.name} onChange={v => set('name', v)} />
              <Bi label="Tagline (editorial)" value={c.tagline} onChange={v => set('tagline', v)} />
              <Bi label="Highlight (one line on cards)" value={c.highlight} onChange={v => set('highlight', v)} />
              <Bi label="Overview" value={c.overview} onChange={v => set('overview', v)} area />
              <Multi label="Countries" values={c.countries || []} onChange={v => set('countries', v)} options={Object.entries(countries).map(([id, x]) => [id, x.en])} />
            </section>

            <section className="ed-section">
              <h2>Facts</h2>
              <div className="ed-grid">
                <Num label="Total days" value={c.totalDays} onChange={v => set('totalDays', v)} />
                <Num label="Walking days" value={c.walkingDays} onChange={v => set('walkingDays', v)} />
                <Num label="Highest point (m)" value={c.maxAltitudeM} onChange={v => set('maxAltitudeM', v)} />
                <Num label="Distance (km)" value={c.distanceKm} onChange={v => set('distanceKm', v)} />
                <label className="ed-field"><span className="ed-label">Daily hours, e.g. 4–6</span><input className="field" value={c.dailyHours || ''} onChange={e => set('dailyHours', e.target.value)} /></label>
                <Num label="Rest / acclimatisation days" value={c.restDays} onChange={v => set('restDays', v)} />
              </div>
              <Bi label="Start point" value={c.start} onChange={v => set('start', v)} />
              <Bi label="End point" value={c.end} onChange={v => set('end', v)} />
              <Bi label="What the duration includes" hint="travel, buffer days" value={c.durationNote} onChange={v => set('durationNote', v)} area />
              <Bi label="Altitude note" value={c.altitudeNote} onChange={v => set('altitudeNote', v)} />
              <Multi label="Months it is trekked" values={c.months || []} onChange={v => set('months', v.sort((a, b) => a - b))} options={months.map(m => [m.n, m.short])} />
              <Multi label="Best months" values={c.bestMonths || []} onChange={v => set('bestMonths', v.sort((a, b) => a - b))} options={months.map(m => [m.n, m.short])} />
              <Multi label="Experience types" values={c.types || []} onChange={v => set('types', v)} options={Object.entries(experienceTypes).map(([id, x]) => [id, x.en])} />
              <Multi label="Landscapes" values={c.landscapes || []} onChange={v => set('landscapes', v)} options={Object.entries(landscapes).map(([id, x]) => [id, x.en])} />
            </section>

            <section className="ed-section">
              <h2>Practical information</h2>
              <Bi label="How to reach" value={c.reach} onChange={v => set('reach', v)} area />
              <Bi label="Fitness" value={c.fitness} onChange={v => set('fitness', v)} area />
              <Bi label="Acclimatisation" value={c.acclimatisation} onChange={v => set('acclimatisation', v)} area />
              <Bi label="Gear" value={c.gear} onChange={v => set('gear', v)} area />
              <Bi label="Permits & logistics" value={c.permits} onChange={v => set('permits', v)} area />
              <label className="check"><input type="checkbox" checked={!!c.specialPermit} onChange={e => set('specialPermit', e.target.checked)} /><span>Special permit or restricted access</span></label>
              <Bi label="Accommodation & meals" value={c.stay} onChange={v => set('stay', v)} area />
              <Bi label="Who it suits" value={c.suits} onChange={v => set('suits', v)} area />
              <Bi label="Limitations" value={c.limitations} onChange={v => set('limitations', v)} area />
            </section>

            <section className="ed-section">
              <h2>Editorial & verification</h2>
              <div className="ed-grid">
                <label className="ed-field"><span className="ed-label">Editorial label</span>
                  <select className="field" value={c.editorial?.label || ''} onChange={e => set('editorial', e.target.value ? { ...(c.editorial || {}), label: e.target.value } : undefined)}>
                    <option value="">None</option>{Object.entries(editorialLabels).map(([id, x]) => <option key={id} value={id}>{x.en}</option>)}
                  </select></label>
                <label className="ed-field"><span className="ed-label">Facts status</span>
                  <select className="field" value={c.verification?.status || 'unverified'} onChange={e => set('verification', { ...(c.verification || {}), status: e.target.value })}>
                    <option value="unverified">Unverified</option><option value="verified">Verified</option>
                  </select></label>
                <label className="ed-field"><span className="ed-label">Last checked</span>
                  <input className="field" type="date" value={c.verification?.checkedOn || ''} onChange={e => set('verification', { ...(c.verification || {}), checkedOn: e.target.value || null })} /></label>
              </div>
              {c.editorial?.label && <Bi label="Why this label (shown on hover)" value={c.editorial?.reason} onChange={v => set('editorial', { ...c.editorial, reason: v })} />}
              <Bi label="Check locally (warning)" value={c.verification?.localCheck} onChange={v => set('verification', { ...(c.verification || {}), localCheck: v })} area />
              <label className="ed-field"><span className="ed-label">Sources (one per line: label | url)</span>
                <textarea className="field" rows={3}
                  value={(c.verification?.sources || []).map(s => `${s.label || ''}${s.url ? ` | ${s.url}` : ''}`).join('\n')}
                  onChange={e => set('verification', { ...(c.verification || {}), sources: e.target.value.split('\n').filter(Boolean).map(l => { const [label, url] = l.split('|').map(x => x.trim()); return url ? { label, url } : { label }; }) })} />
              </label>
            </section>

            <section className="ed-section">
              <h2>Day-by-day itinerary</h2>
              {(c.itinerary || []).map((d, i) => (
                <div key={i} className={`ed-day itin__day--${d.kind}`}>
                  <div className="ed-day__head">
                    <strong>Day {d.day}</strong>
                    <select className="field field--sm" value={d.kind || 'trek'} onChange={e => setDay(i, 'kind', e.target.value)} aria-label={`Day ${d.day} type`}>
                      {Object.entries(dayKinds).map(([id, k]) => <option key={id} value={id}>{k.en}</option>)}
                    </select>
                    <div className="ed-day__moves">
                      <button type="button" className="icon-btn" onClick={() => moveDay(i, -1)} disabled={i === 0} aria-label={`Move day ${d.day} up`}>↑</button>
                      <button type="button" className="icon-btn" onClick={() => moveDay(i, 1)} disabled={i === c.itinerary.length - 1} aria-label={`Move day ${d.day} down`}>↓</button>
                      <button type="button" className="icon-btn" onClick={() => removeDay(i)} aria-label={`Delete day ${d.day}`}>×</button>
                    </div>
                  </div>
                  <Bi label="Route" value={d.route} onChange={v => setDay(i, 'route', v)} />
                  <Bi label="Short description" value={d.description} onChange={v => setDay(i, 'description', v)} area />
                  <div className="ed-grid ed-grid--6">
                    <Num label="Distance km" value={d.distanceKm} onChange={v => setDay(i, 'distanceKm', v)} />
                    <Num label="Ascent m" value={d.ascentM} onChange={v => setDay(i, 'ascentM', v)} />
                    <Num label="Descent m" value={d.descentM} onChange={v => setDay(i, 'descentM', v)} />
                    <label className="ed-field"><span className="ed-label">Hours</span><input className="field" value={d.hours || ''} onChange={e => setDay(i, 'hours', e.target.value)} /></label>
                    <Num label="Altitude m" value={d.altitudeM} onChange={v => setDay(i, 'altitudeM', v)} />
                  </div>
                  <Bi label="Overnight" value={d.overnight} onChange={v => setDay(i, 'overnight', v)} />
                  <Bi label="Meals" value={d.meals} onChange={v => setDay(i, 'meals', v)} />
                  <Bi label="Notes / cautions" value={d.notes} onChange={v => setDay(i, 'notes', v)} />
                </div>
              ))}
              <button type="button" className="btn btn--ghost btn--sm" onClick={addDay}>+ Add day</button>
            </section>
          </form>
        )}
      </div>
    </div>
  );
}
