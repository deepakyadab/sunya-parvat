import React from 'react';
import { useLang } from '../i18n';

export default function LanguageSwitch({ compact = false }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={`lang-switch ${compact ? 'lang-switch--compact' : ''}`} role="group" aria-label={t('a11y.language')}>
      <button type="button" lang="en" aria-pressed={lang === 'en'} className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>
        EN
      </button>
      <button type="button" lang="hi" aria-pressed={lang === 'hi'} className={lang === 'hi' ? 'is-active' : ''} onClick={() => setLang('hi')}>
        हिं
      </button>
    </div>
  );
}
