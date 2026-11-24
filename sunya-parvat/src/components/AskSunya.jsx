import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import { askSunya, botSuggestions } from '../lib/askSunya';
import './AskSunya.css';

const AskContext = createContext({ openAsk: () => {}, closeAsk: () => {}, open: false });
export const useAsk = () => useContext(AskContext);

export function AskProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState(null);
  const openAsk = useCallback((question = null) => { setSeed(question); setOpen(true); }, []);
  const closeAsk = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openAsk, closeAsk, seed, clearSeed: () => setSeed(null) }), [open, openAsk, closeAsk, seed]);
  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
}

/* The conversation itself — used in the floating panel and on /ask. */
export function AskChat({ autoFocus = false, seed, onSeedUsed, onNavigate }) {
  const { lang, t } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [lastTreks, setLastTreks] = useState([]);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const send = useCallback(text => {
    const q = String(text || '').trim();
    if (!q) return;
    const reply = askSunya(q, { lang, context: { lastTreks } });
    if (reply.treks && reply.treks.length) setLastTreks(reply.treks);
    setMessages(m => [...m, { from: 'you', text: q }, { from: 'sunya', ...reply }]);
    setInput('');
  }, [lang, lastTreks]);

  const lastSeed = useRef(null);
  useEffect(() => {
    // guard: React StrictMode runs effects twice in development
    if (seed && lastSeed.current !== seed) {
      lastSeed.current = seed;
      send(seed);
      onSeedUsed && onSeedUsed();
    }
  }, [seed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (autoFocus && inputRef.current) inputRef.current.focus(); }, [autoFocus]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const suggestions = botSuggestions(lang);

  return (
    <div className="ask-chat">
      <div className="ask-chat__log" ref={listRef} role="log" aria-live="polite" aria-label={t('ask.log')}>
        {messages.length === 0 && (
          <div className="ask-msg ask-msg--sunya">
            <p>{t('ask.welcome')}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`ask-msg ask-msg--${m.from}`} lang={m.lang || undefined}>
            {m.from === 'sunya' && <span className="visually-hidden">Sunya: </span>}
            {m.from === 'you' && <span className="visually-hidden">{t('ask.you')}: </span>}
            {String(m.text).split('\n').map((line, j) => (
              <p key={j} className={line.startsWith('•') ? 'ask-msg__bullet' : line.startsWith('⚠') ? 'ask-msg__warn' : undefined}>{line}</p>
            ))}
            {m.live && m.live.status === 'unavailable' && (
              <p className="ask-msg__live">{t('ask.liveUnavailable')}</p>
            )}
            {m.links && m.links.length > 0 && (
              <ul className="ask-msg__links">
                {m.links.map(l => <li key={l.to}><Link to={l.to} onClick={onNavigate}>{l.label} →</Link></li>)}
              </ul>
            )}
            {m.sources && m.sources.length > 0 && (
              <ul className="ask-msg__links ask-msg__sources" aria-label={t('ask.sources')}>
                {m.sources.map(s => <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label} ↗</a></li>)}
              </ul>
            )}
            {m.disclaimer && <p className="ask-msg__disclaimer">{m.disclaimer}</p>}
            {m.suggestions && (
              <div className="ask-chips">
                {m.suggestions.map(s => <button key={s} type="button" className="ask-chip" onClick={() => send(s)}>{s}</button>)}
              </div>
            )}
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="ask-chips ask-chips--start">
          {suggestions.map(s => <button key={s} type="button" className="ask-chip" onClick={() => send(s)}>{s}</button>)}
        </div>
      )}

      <form className="ask-chat__form" onSubmit={e => { e.preventDefault(); send(input); }}>
        <label htmlFor="ask-input" className="visually-hidden">{t('ask.inputLabel')}</label>
        <input
          id="ask-input"
          ref={inputRef}
          className="field ask-chat__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('ask.placeholder')}
          autoComplete="off"
          maxLength={300}
        />
        <button type="submit" className="btn btn--primary btn--sm" disabled={!input.trim()}>{t('ask.send')}</button>
      </form>
      <p className="ask-chat__note">{t('ask.note')}</p>
    </div>
  );
}

/* Floating launcher + panel. Hidden on /ask, where the chat is the page. */
export default function AskSunyaWidget() {
  const { t } = useLang();
  const { open, openAsk, closeAsk, seed, clearSeed } = useAsk();
  const { pathname } = useLocation();
  const panelRef = useRef(null);
  const launcherRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => { if (e.key === 'Escape') { closeAsk(); launcherRef.current && launcherRef.current.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeAsk]);

  if (pathname.startsWith('/ask') || pathname.startsWith('/editor')) return null;

  return (
    <>
      {!open && (
        <button ref={launcherRef} type="button" className="ask-launcher" onClick={() => openAsk()} aria-haspopup="dialog">
          <span className="ask-launcher__dot" aria-hidden="true" />
          {t('nav.ask')}
        </button>
      )}
      {open && (
        <div className="ask-panel" role="dialog" aria-modal="false" aria-labelledby="ask-panel-title" ref={panelRef}>
          <div className="ask-panel__head">
            <div>
              <p id="ask-panel-title" className="ask-panel__title">{t('nav.ask')}</p>
              <p className="ask-panel__sub">{t('ask.sub')}</p>
            </div>
            <div className="ask-panel__head-actions">
              <Link to="/ask" className="btn-text" onClick={closeAsk}>{t('ask.fullPage')}</Link>
              <button type="button" className="icon-btn" onClick={closeAsk} aria-label={t('ask.close')}>×</button>
            </div>
          </div>
          <AskChat autoFocus seed={seed} onSeedUsed={clearSeed} />
        </div>
      )}
    </>
  );
}
