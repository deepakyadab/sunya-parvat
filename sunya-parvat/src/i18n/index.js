import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import strings from './strings';
import { storage } from '../lib/storage';

const LangContext = createContext(null);
export const LANGS = ['en', 'hi'];

function initialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (LANGS.includes(q)) return q;
  } catch (e) { /* ignore */ }
  const saved = storage.get('sp.lang');
  return LANGS.includes(saved) ? saved : 'en';
}

/** Read a bilingual field like { en, hi }. Falls back to English. */
export function pick(field, lang) {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.en || '';
}

/** True when the requested language is missing and English is shown instead. */
export function isFallback(field, lang) {
  if (!field || typeof field === 'string') return lang !== 'en';
  return lang !== 'en' && !field[lang];
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    storage.set('sp.lang', lang);
  }, [lang]);

  const setLang = useCallback(l => { if (LANGS.includes(l)) setLangState(l); }, []);

  const t = useCallback((key, vars) => {
    let s = (strings[lang] && strings[lang][key]) ?? strings.en[key] ?? key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split(`{${k}}`).join(vars[k]); });
    return s;
  }, [lang]);

  const tx = useCallback(field => pick(field, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, tx }), [lang, setLang, t, tx]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
