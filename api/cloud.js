// Birleşik bulut servis dispatcher'ı — Vercel Hobby plan 12 fonksiyon sınırı için
// birden çok endpoint TEK serverless fonksiyonda toplanır. Alt-handler'lar `_`
// önekli dosyalarda (Vercel bunları fonksiyon SAYMAZ). Eski public path'ler
// vercel.json rewrites ile korunur → installer/panel çağrıları AYNEN çalışır.
//
//   /api/gdrive-oauth    -> ?_svc=gdrive
//   /api/gdrive-callback -> ?_svc=gdrive-callback
//   /api/game-status     -> ?_svc=gamestatus
//   /api/announcements   -> ?_svc=announcements
//   /api/covers          -> ?_svc=covers
//   /api/reset-codes     -> ?_svc=reset-codes
import gdriveOauth from './_gdrive-oauth.js';
import gdriveCallback from './_gdrive-callback.js';
import gameStatus from './_game-status.js';
import announcements from './_announcements.js';
import covers from './_covers.js';
import resetCodes from './_reset-codes.js';

const ROUTES = {
  'gdrive': gdriveOauth,
  'gdrive-callback': gdriveCallback,
  'gamestatus': gameStatus,
  'announcements': announcements,
  'covers': covers,
  'reset-codes': resetCodes,
};

export default async function handler(req, res) {
  const svc = req.query._svc;
  const fn = ROUTES[svc];
  if (!fn) {
    return res.status(400).json({ error: `Bilinmeyen servis: ${svc || '(yok)'}` });
  }
  return fn(req, res);
}
