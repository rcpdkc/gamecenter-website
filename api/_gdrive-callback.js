// Google OAuth geri dönüş (redirect) hedefi — kafe sunucusu YERINE website alır.
// Boylece izin ekrani HANGI PC'den acildiysa orada calisir (public HTTPS), sunucuya gerek yok.
// Google Cloud > Web application client > Authorized redirect URI:
//   https://gamecenter.rcpdkc.com/api/gdrive-callback
// Vercel env: GOOGLE_WEB_CLIENT_ID , GOOGLE_WEB_CLIENT_SECRET
import { sql } from './_db.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REDIRECT = 'https://gamecenter.rcpdkc.com/api/gdrive-callback';

function page(title, msg, ok) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
  <style>body{margin:0;height:100vh;display:grid;place-items:center;background:#0a0b10;color:#e8ecf3;font-family:system-ui,Segoe UI,sans-serif}
  .c{max-width:440px;text-align:center;padding:40px}.i{font-size:56px;margin-bottom:10px}h2{font-size:24px;margin:0 0 8px}p{color:#98a2b3;line-height:1.6}</style></head>
  <body><div class="c"><div class="i">${ok ? '✅' : '⚠️'}</div><h2>${title}</h2><p>${msg}</p></div></body></html>`;
}

function emailFromIdToken(idt) {
  try { const p = idt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(Buffer.from(p, 'base64').toString()).email || ''; }
  catch { return ''; }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const code = req.query.code;
  let cafe = '', secret = '';
  try {
    const st = JSON.parse(Buffer.from(String(req.query.state || ''), 'base64url').toString());
    cafe = st.cafe || ''; secret = st.s || '';
  } catch { /* gecersiz state */ }

  if (!code || !cafe || !secret) return res.status(200).send(page('Bağlantı başarısız', 'Eksik bilgi. Panele dönüp tekrar deneyin.', false));

  const cid = (process.env.GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_DRIVE_CLIENT_ID || '').trim();
  const csec = (process.env.GOOGLE_WEB_CLIENT_SECRET || process.env.GOOGLE_DRIVE_CLIENT_SECRET || '').trim();
  if (!cid || !csec) return res.status(200).send(page('Yapılandırma eksik', 'Sunucu OAuth ayarı tamamlanmamış (Vercel env).', false));

  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: cid, client_secret: csec, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
    });
    const j = await r.json();
    if (!r.ok || !j.refresh_token) {
      return res.status(200).send(page('Bağlantı başarısız', 'Google yetkilendirmeyi tamamlayamadı. Panele dönüp tekrar deneyin.', false));
    }
    const email = emailFromIdToken(j.id_token || '');
    await sql`CREATE TABLE IF NOT EXISTS gdrive_accounts (
      cafe_id TEXT PRIMARY KEY, secret TEXT NOT NULL, refresh_token TEXT NOT NULL, email TEXT, created_at TIMESTAMP DEFAULT now())`;
    await sql`INSERT INTO gdrive_accounts (cafe_id, secret, refresh_token, email, created_at)
      VALUES (${cafe}, ${secret}, ${j.refresh_token}, ${email}, now())
      ON CONFLICT (cafe_id) DO UPDATE SET secret=${secret}, refresh_token=${j.refresh_token}, email=${email}, created_at=now()`;
    return res.status(200).send(page('Google Drive bağlandı ✓', 'Bu pencereyi kapatıp panele dönebilirsiniz. Yedekleme birkaç saniye içinde aktifleşir.', true));
  } catch (e) {
    return res.status(200).send(page('Bağlantı hatası', 'Beklenmeyen bir hata oluştu. Tekrar deneyin.', false));
  }
}
