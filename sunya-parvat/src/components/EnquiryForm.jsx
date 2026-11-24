import React, { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';
import { treks } from '../data/treks';
import './EnquiryForm.css';

/*
  Contact / trek enquiry form. Posts to /api/enquiry (api/enquiry.js on Vercel),
  which emails the enquiry to the address in the server's ENQUIRY_TO setting.
  The success message appears only after the email provider has accepted the message.
*/
const EMAIL_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[^\s@<>()[\],;:"]{2,}$/;
export const PUBLIC_CONTACT = 'sunyaparvat@gmail.com';

function check(v) {
  const e = {};
  const name = v.name.trim();
  const message = v.message.trim();
  if (name.length < 2) e.name = 'required';
  else if (name.length > 80) e.name = 'too_long';
  if (!v.email.trim()) e.email = 'required';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'invalid';
  if (!message) e.message = 'required';
  else if (message.length < 10) e.message = 'too_short';
  else if (message.length > 2000) e.message = 'too_long';
  return e;
}

export default function EnquiryForm({ trek = null, initialTrek = '', idPrefix = 'enq', compact = false }) {
  const { lang, t, tx } = useLang();
  const [values, setValues] = useState({ name: '', email: '', trek: trek ? trek.id : initialTrek, message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | sent | failed | limited
  const startedAt = useRef(Date.now());
  const statusRef = useRef(null);

  useEffect(() => { if (trek) setValues(v => ({ ...v, trek: trek.id })); }, [trek]);

  const set = key => e => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key]) setErrors(check(next));
  };
  const blur = key => () => { setTouched(s => ({ ...s, [key]: true })); setErrors(check(values)); };

  const submit = async e => {
    e.preventDefault();
    const errs = check(values);
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errs).length) {
      const first = ['name', 'email', 'message'].find(k => errs[k]);
      document.getElementById(`${idPrefix}-${first}`)?.focus();
      return;
    }
    setState('sending');
    const selected = treks.find(x => x.id === values.trek);
    try {
      const r = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name, email: values.email, message: values.message,
          trek: selected ? selected.id : '', trekName: selected ? selected.name.en : '',
          lang, website: values.website, startedAt: startedAt.current,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setState('sent');
      } else if (r.status === 400 && j.fields) {
        setErrors(j.fields);
        setState('idle');
      } else {
        setState(r.status === 429 ? 'limited' : 'failed');
      }
    } catch (err) {
      setState('failed');
    }
    setTimeout(() => statusRef.current && statusRef.current.focus(), 30);
  };

  const errText = (field, code) => code && t(`enq.err.${field}.${code}`);
  const showErr = key => touched[key] && errors[key];

  if (state === 'sent') {
    return (
      <div className="enq enq--done" ref={statusRef} tabIndex={-1} role="status">
        <p className="enq__done-title">{t('enq.sentTitle')}</p>
        <p>{t('enq.sentText', { email: values.email })}</p>
        <button type="button" className="btn-text" onClick={() => {
          setValues(v => ({ ...v, message: '' })); setTouched({}); setErrors({}); startedAt.current = Date.now(); setState('idle');
        }}>{t('enq.another')}</button>
      </div>
    );
  }

  const field = (key, label, input) => (
    <div className={`enq__field ${showErr(key) ? 'has-error' : ''}`}>
      <label htmlFor={`${idPrefix}-${key}`}>{label}</label>
      {input}
      {showErr(key) && <p className="enq__error" id={`${idPrefix}-${key}-err`}>{errText(key, errors[key])}</p>}
    </div>
  );
  const a11y = key => ({ 'aria-invalid': showErr(key) ? 'true' : undefined, 'aria-describedby': showErr(key) ? `${idPrefix}-${key}-err` : undefined });

  return (
    <form className={`enq ${compact ? 'enq--compact' : ''}`} onSubmit={submit} noValidate>
      {(state === 'failed' || state === 'limited') && (
        <div className="enq__alert" role="alert" ref={statusRef} tabIndex={-1}>
          <strong>{t(state === 'limited' ? 'enq.limitedTitle' : 'enq.failedTitle')}</strong>
          <p>{t(state === 'limited' ? 'enq.limitedText' : 'enq.failedText')}</p>
          <p className="enq__fallback">{t('enq.fallback')} <a href={`mailto:${PUBLIC_CONTACT}`} className="text-link">{PUBLIC_CONTACT}</a></p>
        </div>
      )}

      <div className="enq__row">
        {field('name', t('enq.name'), (
          <input id={`${idPrefix}-name`} className="field" name="name" autoComplete="name" maxLength={80}
            value={values.name} onChange={set('name')} onBlur={blur('name')} {...a11y('name')} />
        ))}
        {field('email', t('enq.email'), (
          <input id={`${idPrefix}-email`} className="field" name="email" type="email" autoComplete="email" inputMode="email" maxLength={254}
            value={values.email} onChange={set('email')} onBlur={blur('email')} {...a11y('email')} />
        ))}
      </div>

      {trek ? (
        <p className="enq__trek">{t('enq.aboutTrek')} <strong>{tx(trek.name)}</strong></p>
      ) : (
        <div className="enq__field">
          <label htmlFor={`${idPrefix}-trek`}>{t('enq.trek')} <span className="enq__optional">{t('common.optional')}</span></label>
          <select id={`${idPrefix}-trek`} className="field" value={values.trek} onChange={set('trek')}>
            <option value="">{t('enq.noTrek')}</option>
            {treks.map(x => <option key={x.id} value={x.id}>{tx(x.name)}</option>)}
          </select>
        </div>
      )}

      {field('message', t('enq.message'), (
        <>
          <textarea id={`${idPrefix}-message`} className="field" name="message" rows={compact ? 4 : 6} maxLength={2000}
            value={values.message} onChange={set('message')} onBlur={blur('message')} {...a11y('message')}
            placeholder={t(trek ? 'enq.placeholderTrek' : 'enq.placeholder')} />
          <span className="enq__count" aria-hidden="true">{values.message.length}/2000</span>
        </>
      ))}

      {/* Honeypot: hidden from people, often filled by bots. */}
      <div className="enq__hp" aria-hidden="true">
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input id={`${idPrefix}-website`} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>

      <div className="enq__submit">
        <button type="submit" className="btn btn--primary" disabled={state === 'sending'} aria-busy={state === 'sending'}>
          {state === 'sending' ? t('enq.sending') : state === 'failed' || state === 'limited' ? t('enq.retry') : t('enq.send')}
        </button>
        <p className="enq__privacy">{t('enq.privacy')}</p>
      </div>
    </form>
  );
}
