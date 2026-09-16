// ═══════════════════════════════════════════════════════════
// /api/inquiries
//
//   POST — public contact-form submission
//   GET  — admin read, requires `Authorization: Bearer <ADMIN_TOKEN>`
//
// Uses the service_role key, which bypasses RLS, so the browser never
// needs a database credential. Plain fetch is used instead of the
// Supabase SDK so package.json and package-lock.json stay untouched.
//
// Required environment variables (set in Vercel, never committed):
//   SUPABASE_URL               e.g. https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  service_role key — server-side only
//   ADMIN_TOKEN                any long random string, for GET access
// ═══════════════════════════════════════════════════════════

import { timingSafeEqual } from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

const MAX = { name: 200, email: 254, organization: 200, case_type: 100, message: 5000 };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PRIORITIES = new Set(['standard', 'high', 'critical']);

// Best-effort per-instance throttle. Serverless instances are ephemeral and
// horizontally scaled, so this blunts casual abuse but is not a hard guarantee.
// For real protection put hCaptcha/Turnstile in front of the form.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function throttled(key) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function str(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

async function supabase(path, init) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init && init.headers),
    },
  });
}

async function submit(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Malformed JSON body.' });
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Expected a JSON object.' });
  }

  // Honeypot: hidden field that real users never fill. Report success so
  // automated senders do not learn they were filtered.
  if (str(body.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  if (throttled(clientIp(req))) {
    return res.status(429).json({ error: 'Too many submissions. Please try again shortly.' });
  }

  const record = {
    name: str(body.name, MAX.name),
    email: str(body.email, MAX.email),
    organization: str(body.organization, MAX.organization) || null,
    case_type: str(body.case_type, MAX.case_type) || null,
    priority: PRIORITIES.has(body.priority) ? body.priority : 'standard',
    message: str(body.message, MAX.message),
  };

  const problems = [];
  if (!record.name) problems.push('name is required');
  if (!EMAIL_RE.test(record.email)) problems.push('a valid email is required');
  if (!record.message) problems.push('message is required');
  if (problems.length) {
    return res.status(400).json({ error: problems.join('; ') });
  }

  const r = await supabase('inquiries', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(record),
  });

  if (!r.ok) {
    console.error('[api/inquiries] insert failed', r.status, await r.text());
    return res.status(502).json({ error: 'Could not store submission.' });
  }

  return res.status(201).json({ ok: true });
}

async function list(req, res) {
  if (!ADMIN_TOKEN) {
    console.error('[api/inquiries] ADMIN_TOKEN is not configured');
    return res.status(500).json({ error: 'Server is not configured.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !safeEqual(token, ADMIN_TOKEN)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const requested = Number.parseInt(req.query && req.query.limit, 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 200) : 50;

  const r = await supabase(
    `inquiries?select=id,created_at,name,email,organization,case_type,priority,message&order=created_at.desc&limit=${limit}`,
    { method: 'GET' }
  );

  if (!r.ok) {
    console.error('[api/inquiries] read failed', r.status, await r.text());
    return res.status(502).json({ error: 'Could not read submissions.' });
  }

  return res.status(200).json({ data: await r.json() });
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('[api/inquiries] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
    return res.status(500).json({ error: 'Server is not configured.' });
  }

  try {
    if (req.method === 'POST') return await submit(req, res);
    if (req.method === 'GET') return await list(req, res);
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/inquiries] unhandled error', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}
