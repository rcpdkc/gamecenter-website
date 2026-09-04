// Google Drive OAuth broker — kafe sunucularinin YERINE OAuth'u website yurutur.
// ?action=start   (GET  cafe,s) -> Google izin ekranina 302 (izin ekrani KULLANICININ PC'sinde acilir)
// ?action=token   (POST cafe,s) -> saklanan refresh_token'i tazeleyip kisa-omurlu access_token doner
// ?action=status  (GET  cafe,s) -> {connected,email}
// ?action=disconnect (POST cafe,s) -> revoke + sil
// Vercel env: GOOGLE_WEB_CLIENT_ID , GOOGLE_WEB_CLIENT_SECRET
import { sql } from './_db.js';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const REDIRECT = 'https://gamecenter.rcpdkc.com/api/gdrive-callback';
const SCOPE = 'openid email https://www.googleapis.com/auth/drive.file';

// İki isim de kabul: GOOGLE_WEB_CLIENT_ID (yeni) veya GOOGLE_DRIVE_CLIENT_ID (Vercel'de kurulu olan).
const CID = () => (process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_DRIVE_CLIENT_ID || '').trim();
const CSEC = () => (process.env.GOOGLE_WEB_CLIENT_SECRET || process.env.GOOGLE_DRIVE_CLIENT_SECRET || '').trim();

async function row(cafe) {
  try {
    const { rows } = await sql`SELECT cafe_id, secret, refresh_token, email FROM gdrive_accounts WHERE cafe_id=${cafe}`;
    return rows[0] || null;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;
  const body = req.body || {};
  const cafe = (req.query.cafe || body.cafe || '').toString().trim();
  const s = (req.query.s || body.s || '').toString().trim();

  // ── START: Google izin ekranina yonlendir ──
  if (action === 'start') {
    if (!CID()) return res.status(500).send('Yapilandirma eksik (GOOGLE_WEB_CLIENT_ID).');
    if (!cafe || !s) return res.status(400).send('cafe ve s zorunlu.');
    const state = Buffer.from(JSON.stringify({ cafe, s })).toString('base64url');
    const url = AUTH_URL + '?' + new URLSearchParams({
      client_id: CID(), redirect_uri: REDIRECT, response_type: 'code',
      scope: SCOPE, access_type: 'offline', prompt: 'consent', state,
    });
    res.writeHead(302, { Location: url });
    return res.end();
  }

  if (!cafe || !s) return res.status(400).json({ ok: false, error: 'missing_params' });

  // ── STATUS ──
  if (action === 'status') {
    const r = await row(cafe);
    return res.status(200).json({ ok: true, connected: !!(r && r.secret === s), email: r?.email || '' });
  }

  // ── TOKEN: refresh_token -> access_token ──
  if (action === 'token') {
    const r = await row(cafe);
    if (!r || r.secret !== s) return res.status(200).json({ ok: false, error: 'not_connected' });
    try {
      const tr = await fetch(TOKEN_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: CID(), client_secret: CSEC(), refresh_token: r.refresh_token, grant_type: 'refresh_token' }),
      });
      const j = await tr.json();
      if (!tr.ok || !j.access_token) return res.status(200).json({ ok: false, error: 'refresh_failed' });
      return res.status(200).json({ ok: true, access_token: j.access_token, expires_in: j.expires_in || 3600, email: r.email || '' });
    } catch { return res.status(200).json({ ok: false, error: 'exception' }); }
  }

  // ── DISCONNECT ──
  if (action === 'disconnect') {
    const r = await row(cafe);
    if (r && r.secret === s) {
      try { await fetch(REVOKE_URL + '?token=' + encodeURIComponent(r.refresh_token), { method: 'POST' }); } catch { /* yoksay */ }
      try { await sql`DELETE FROM gdrive_accounts WHERE cafe_id=${cafe}`; } catch { /* yoksay */ }
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ ok: false, error: 'unknown_action' });
}
