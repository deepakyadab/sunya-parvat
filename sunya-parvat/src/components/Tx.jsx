import React from 'react';
import { useLang, isFallback, pick } from '../i18n';

/*
  Renders a bilingual field. If the visitor chose Hindi and only English
  exists, the English text is shown with an "English" marker instead of a
  machine translation.
*/
export default function Tx({ field, as: Tag = 'span', className, fallback = null }) {
  const { lang, t } = useLang();
  if (field == null || (typeof field === 'object' && !field.en && !field.hi)) return fallback;
  const fb = isFallback(field, lang);
  return (
    <Tag className={className} lang={fb ? 'en' : undefined}>
      {pick(field, lang)}
      {fb && <span className="lang-tag">{t('common.englishOnly')}</span>}
    </Tag>
  );
}

export function NotVerified() {
  const { t } = useLang();
  return <span className="not-verified" title={t('common.notVerifiedHint')}>{t('common.notVerified')}</span>;
}

export function Fact({ value }) {
  return value == null || value === '' ? <NotVerified /> : <>{value}</>;
}
