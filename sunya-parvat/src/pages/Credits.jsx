import React from 'react';
import { Link } from 'react-router-dom';
import { treks } from '../data/treks';
import { useLang } from '../i18n';
import { hasPhoto } from '../components/TrekVisual';
import usePageMeta from '../lib/usePageMeta';
import { HERO_PHOTO } from '../data/sitePhotos';

export default function Credits() {
  const { t, tx } = useLang();
  usePageMeta({ title: t('photo.credits'), description: 'Sources, photographers and licenses for the photographs on Sunya Parvat.', path: '/credits' });
  const withPhoto = treks.filter(hasPhoto);
  const without = treks.filter(x => !hasPhoto(x));

  return (
    <div className="page-wrapper">
      <header className="page-hero page-hero--small">
        <div className="container--narrow">
          <p className="section-label">{t('photo.credits')}</p>
          <h1 className="page-title">{t('photo.credits')}</h1>
          <p className="page-subtitle">{t('credits.intro')}</p>
        </div>
      </header>
      <div className="container--narrow">
        <table className="ed-table credits-table">
          <thead><tr><th>{t('credits.trek')}</th><th>{t('credits.photo')}</th><th>{t('credits.license')}</th></tr></thead>
          <tbody>
            <tr>
              <td>{t('credits.home')}</td>
              <td><a className="text-link" href={HERO_PHOTO.sourceUrl} target="_blank" rel="noreferrer">{HERO_PHOTO.author}</a> — {tx(HERO_PHOTO.alt)}</td>
              <td><a className="text-link" href={HERO_PHOTO.licenseUrl} target="_blank" rel="noreferrer license">{HERO_PHOTO.license}</a></td>
            </tr>
            {withPhoto.map(x => (
              <tr key={x.id}>
                <td><Link className="text-link" to={`/treks/${x.id}`}>{tx(x.name)}</Link>{x.image.scope === 'regional' && <><br /><small>{t('photo.regional')}</small></>}</td>
                <td><a className="text-link" href={x.image.sourceUrl} target="_blank" rel="noreferrer">{x.image.author || 'Wikimedia Commons'}</a> — {tx(x.image.alt)}</td>
                <td>{x.image.licenseUrl ? <a className="text-link" href={x.image.licenseUrl} target="_blank" rel="noreferrer license">{x.image.license}</a> : x.image.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="note" style={{ marginTop: '2rem' }}>{t('credits.galleries')}</p>
        {without.length > 0 && (
          <p className="note" style={{ marginTop: '2rem' }}>{t('credits.pending', { n: without.length })} {without.map(x => tx(x.name)).join(', ')}.</p>
        )}
      </div>
    </div>
  );
}
