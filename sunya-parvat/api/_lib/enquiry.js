/*
  Enquiry delivery — server-side only. Never imported by browser code.

  Environment variables (set in Vercel → Project → Settings → Environment Variables,
  or in .env.local for local development — never commit real values):

    RESEND_API_KEY      API key from https://resend.com (secret)
    ENQUIRY_TO          Where enquiries go. Production value: sunyaparvat@gmail.com
    ENQUIRY_FROM        Sender, e.g. "Sunya Parvat <enquiries@your-verified-domain>".
                        Until a domain is verified in Resend, use
                        "Sunya Parvat <onboarding@resend.dev>" (Resend then only delivers
                        to the address that owns the Resend account).
    ENQUIRY_SEND_ACK    "true" to email the visitor a short acknowledgement
                        (needs a verified sending domain).
    SITE_URL            Public site URL, used for trek links and origin checks.
    EMAIL_PROVIDER      "resend" (default). For local testing only: "mock" logs the
                        email instead of sending; "mock-fail" simulates a provider error.
                        Mock providers are refused in production.
*/

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EMAIL_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[^\s@<>()[\],;:"]{2,}$/;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const LIMITS = { name: [2, 80], email: [5, 254], message: [10, 2000] };
const MIN_FILL_MS = 3000;          // faster than this is almost certainly a bot
const RATE = { windowMs: 10 * 60 * 1000, max: 5 };

/* ---------- validation ---------- */

function clean(v, max) {
  return String(v == null ? '' : v).replace(CONTROL_RE, '').trim().slice(0, max + 1);
}

function validate(body) {
  const errors = {};
  const name = clean(body.name, LIMITS.name[1]).replace(/\s+/g, ' ');
  const email = clean(body.email, LIMITS.email[1]).toLowerCase();
  const message = clean(body.message, LIMITS.message[1]);
  const trek = clean(body.trek, 60);
  const trekName = clean(body.trekName, 100).replace(/[\r\n]+/g, ' ');
  const lang = body.lang === 'hi' ? 'hi' : 'en';

  if (name.length < LIMITS.name[0]) errors.name = 'required';
  else if (name.length > LIMITS.name[1]) errors.name = 'too_long';
  if (!email) errors.email = 'required';
  else if (email.length > LIMITS.email[1] || !EMAIL_RE.test(email)) errors.email = 'invalid';
  if (message.length < LIMITS.message[0]) errors.message = message ? 'too_short' : 'required';
  else if (message.length > LIMITS.message[1]) errors.message = 'too_long';
  if (trek && !ID_RE.test(trek)) errors.trek = 'invalid';

  return { errors, data: { name, email, message, trek: trek || null, trekName: trek ? trekName || trek : null, lang } };
}

/** Why a submission looks automated, or null. Reasons are safe to log (no personal data). */
function spamReason(body) {
  if (clean(body.website, 200)) return 'honeypot_filled';    // honeypot field humans never see
  const started = Number(body.startedAt);
  if (!started) return 'missing_start_time';
  if (Date.now() - started < MIN_FILL_MS) return 'sent_too_fast';
  if (Date.now() - started > 24 * 60 * 60 * 1000) return 'form_too_old';
  const links = (String(body.message || '').match(/https?:\/\//gi) || []).length;
  return links > 3 ? 'too_many_links' : null;
}
const isSpam = body => spamReason(body) !== null;

/* ---------- rate limiting (best effort, per serverless instance) ---------- */

const hits = new Map();
function rateLimited(key, now = Date.now()) {
  const list = (hits.get(key) || []).filter(t => now - t < RATE.windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE.max;
}

/* ---------- email content ---------- */

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = s => String(s).replace(/[\r\n]+/g, ' ').slice(0, 120);

function notification(d, site) {
  const trekLine = d.trek ? `${d.trekName} (${site}/treks/${d.trek})` : 'General enquiry';
  const subject = oneLine(d.trek ? `Trek enquiry: ${d.trekName} — ${d.name}` : `Website enquiry — ${d.name}`);
  const text = [
    `New enquiry from the Sunya Parvat website`,
    ``,
    `Name: ${d.name}`,
    `Reply to: ${d.email}`,
    `Trek: ${trekLine}`,
    `Language: ${d.lang === 'hi' ? 'Hindi' : 'English'}`,
    ``,
    `Message:`,
    d.message,
    ``,
    `— Reply directly to this email to answer ${d.name}.`,
  ].join('\n');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#222">
<p style="margin:0 0 12px"><strong>New enquiry from the Sunya Parvat website</strong></p>
<table style="border-collapse:collapse;margin-bottom:12px">
<tr><td style="padding:2px 12px 2px 0;color:#666">Name</td><td>${esc(d.name)}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#666">Reply to</td><td><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#666">Trek</td><td>${d.trek ? `<a href="${esc(`${site}/treks/${d.trek}`)}">${esc(d.trekName)}</a>` : 'General enquiry'}</td></tr>
<tr><td style="padding:2px 12px 2px 0;color:#666">Language</td><td>${d.lang === 'hi' ? 'Hindi' : 'English'}</td></tr>
</table>
<div style="white-space:pre-wrap;border-left:3px solid #c9a96e;padding-left:12px">${esc(d.message)}</div>
<p style="color:#888;font-size:13px">Reply directly to this email to answer ${esc(d.name)}.</p></div>`;
  return { subject, text, html };
}

function acknowledgement(d) {
  if (d.lang === 'hi') {
    return {
      subject: 'आपका संदेश मिल गया — शून्य पर्वत',
      text: `नमस्ते ${d.name},\n\nआपका संदेश${d.trek ? ` (${d.trekName})` : ''} हमें मिल गया है। हम इसे ध्यान से पढ़कर जल्द जवाब देंगे।\n\n— शून्य पर्वत\n\nयह एक स्वचालित पुष्टि है। आपकी जानकारी केवल आपके सवाल का जवाब देने के लिए उपयोग की जाएगी।`,
    };
  }
  return {
    subject: 'We received your message — Sunya Parvat',
    text: `Hello ${d.name},\n\nThank you for writing${d.trek ? ` about ${d.trekName}` : ''}. Your message has reached us, and we will read it carefully and reply soon.\n\n— Sunya Parvat\n\nThis is an automatic confirmation. Your details are used only to reply to your enquiry.`,
  };
}

/* ---------- providers ---------- */

async function sendResend({ key, from, to, replyTo, subject, text, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text, html }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    const err = new Error(`Resend responded ${r.status}`);
    err.detail = detail.slice(0, 300);
    throw err;
  }
  const j = await r.json();
  if (!j || !j.id) throw new Error('Resend did not return a message id');
  return j.id;
}

function providerFor(env) {
  const name = (env.EMAIL_PROVIDER || 'resend').toLowerCase();
  const prod = env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
  if (name === 'mock' || name === 'mock-fail') {
    if (prod) return null;   // mocks must never stand in for real delivery
    return async msg => {
      if (name === 'mock-fail') throw new Error('Simulated provider failure (EMAIL_PROVIDER=mock-fail)');
      console.log(`[mock email] to=${msg.to} reply_to=${msg.replyTo || '-'} subject="${msg.subject}"\n${msg.text}\n`);
      return `mock-${Date.now()}`;
    };
  }
  if (name === 'resend') {
    if (!env.RESEND_API_KEY || !env.ENQUIRY_FROM) return null;
    return msg => sendResend({ key: env.RESEND_API_KEY, from: env.ENQUIRY_FROM, ...msg });
  }
  return null;
}

/* ---------- main ---------- */

/**
 * Returns { status, body } so it can run on Vercel or in the local dev server.
 * Response bodies never contain configuration or provider details.
 */
async function handleEnquiry({ method, body, ip, origin, env = process.env }) {
  if (method !== 'POST') return { status: 405, body: { ok: false, error: 'method_not_allowed' } };

  const site = (env.SITE_URL || 'https://sunyaparvat.vercel.app').replace(/\/$/, '');
  const allowed = [site, 'http://localhost:3000', 'http://127.0.0.1:3000', ...(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)];
  const preview = env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null;
  if (preview) allowed.push(preview);
  if (origin && !allowed.includes(origin)) return { status: 403, body: { ok: false, error: 'forbidden' } };

  if (!body || typeof body !== 'object') return { status: 400, body: { ok: false, error: 'invalid_request' } };
  if (rateLimited(ip || 'unknown')) return { status: 429, body: { ok: false, error: 'rate_limited' } };

  const { errors, data } = validate(body);
  if (Object.keys(errors).length) return { status: 400, body: { ok: false, error: 'validation', fields: errors } };

  // Pretend success to bots so they do not retry; nothing is sent. The log line lets the
  // owner tell "dropped as spam" from "delivered" in the Vercel logs.
  const spam = spamReason(body);
  if (spam) {
    console.warn(`[enquiry] dropped as likely spam: ${spam}`);
    return { status: 200, body: { ok: true } };
  }

  const to = env.ENQUIRY_TO;
  const send = providerFor(env);
  if (!send || !to) {
    console.error('[enquiry] email delivery is not configured (check RESEND_API_KEY, ENQUIRY_FROM, ENQUIRY_TO)');
    return { status: 503, body: { ok: false, error: 'unavailable' } };
  }

  const n = notification(data, site);
  try {
    await send({ to, replyTo: data.email, ...n });
  } catch (e) {
    console.error('[enquiry] delivery failed:', e.message, e.detail || '');
    return { status: 502, body: { ok: false, error: 'delivery_failed' } };
  }
  console.log(`[enquiry] delivered (${data.trek ? 'trek enquiry' : 'contact message'})`);

  if (String(env.ENQUIRY_SEND_ACK).toLowerCase() === 'true') {
    const a = acknowledgement(data);
    try {
      await send({ to: data.email, replyTo: to, subject: a.subject, text: a.text, html: `<pre style="font-family:Arial,sans-serif;font-size:15px;white-space:pre-wrap">${esc(a.text)}</pre>` });
    } catch (e) {
      console.error('[enquiry] acknowledgement failed (enquiry itself was delivered):', e.message);
    }
  }

  return { status: 200, body: { ok: true } };
}

module.exports = { handleEnquiry, validate, isSpam, spamReason, _resetRateLimit: () => hits.clear() };
