import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AskChat } from '../components/AskSunya';
import { useLang } from '../i18n';
import usePageMeta from '../lib/usePageMeta';

export default function Ask() {
  const { t } = useLang();
  const [params] = useSearchParams();
  usePageMeta({ title: t('nav.ask'), description: t('meta.ask'), path: '/ask' });

  return (
    <div className="page-wrapper ask-page">
      <header className="page-hero page-hero--small">
        <div className="container--narrow">
          <p className="section-label">{t('nav.ask')}</p>
          <h1 className="page-title">{t('ask.pageTitle')}</h1>
          <p className="page-subtitle">{t('ask.pageSub')}</p>
        </div>
      </header>
      <div className="container--narrow">
        <div className="ask-page__box">
          <AskChat autoFocus seed={params.get('q')} />
        </div>
        <ul className="ask-page__limits">
          <li>{t('ask.limit1')}</li>
          <li>{t('ask.limit2')}</li>
          <li>{t('ask.limit3')}</li>
        </ul>
      </div>
    </div>
  );
}
