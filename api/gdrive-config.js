// Google Drive Desktop OAuth client'i — kafe sunuculari BURADAN ceker (merkezi; rotasyon icin).
// Vercel ortam degiskenleri:  GOOGLE_DRIVE_CLIENT_ID , GOOGLE_DRIVE_CLIENT_SECRET
// Not: Desktop OAuth client'ta "secret" gizli DEGILDIR (Google boyle belirtir), bu yuzden servis edilebilir.
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client_id = (process.env.GOOGLE_DRIVE_CLIENT_ID || '').trim();
  const client_secret = (process.env.GOOGLE_DRIVE_CLIENT_SECRET || '').trim();

  if (!client_id || !client_secret) {
    return res.status(200).json({ ok: false, error: 'not_configured' });
  }
  return res.status(200).json({ ok: true, client_id, client_secret });
}
