import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import { useSaved, MAX_COMPARE } from '../context/SavedContext';
import { getTrek } from '../data/treks';
import './CompareTray.css';

export default function CompareTray() {
  const { t, tx } = useLang();
  const { compare, toggleCompare, clearCompare, notice, clearNotice } = useSaved();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(clearNotice, 3500);
    return () => clearTimeout(id);
  }, [notice, clearNotice]);

  if (!compare.length || pathname.startsWith('/compare') || pathname.startsWith('/editor')) {
    return notice ? <div className="toast" role="status">{t(notice, { max: MAX_COMPARE })}</div> : null;
  }

  const list = compare.map(getTrek).filter(Boolean);

  return (
    <>
      {notice && <div className="toast toast--raised" role="status">{t(notice, { max: MAX_COMPARE })}</div>}
      <aside className="ctray" aria-label={t('compare.trayLabel')}>
        <div className="ctray__inner">
          <span className="ctray__title">{t('compare.tray', { n: list.length, max: MAX_COMPARE })}</span>
          <ul className="ctray__list">
            {list.map(tr => (
              <li key={tr.id} className="ctray__chip">
                <span>{tx(tr.name)}</span>
                <button type="button" onClick={() => toggleCompare(tr.id)} aria-label={t('compare.remove', { name: tx(tr.name) })}>×</button>
              </li>
            ))}
          </ul>
          <div className="ctray__actions">
            <button type="button" className="btn-text" onClick={clearCompare}>{t('common.clear')}</button>
            {list.length >= 2
              ? <Link to={`/compare?ids=${list.map(x => x.id).join(',')}`} className="btn btn--primary btn--sm">{t('compare.go')}</Link>
              : <span className="ctray__hint">{t('compare.addOne')}</span>}
          </div>
        </div>
      </aside>
    </>
  );
}
