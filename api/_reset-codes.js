import { sql } from './_db.js';

// Yerel panel admin şifre sıfırlama kodları — SÜPERADMIN üretir, kafeye verir.
// Genel · TEK KULLANIMLIK · 1 saat geçerli (kullanılmazsa pasif).
// cloud.js dispatcher üzerinden ?_svc=reset-codes ile çağrılır (12-fonksiyon limiti).

// PERF: tablo yalnız warm instance başına BİR kez oluşturulur (her istekte değil).
let _rcReady = false;
async function ensureRc() {
  if (_rcReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS admin_reset_codes (
      id SERIAL PRIMARY KEY,
      code VARCHAR(24) UNIQUE NOT NULL,
      note VARCHAR(255),
      used BOOLEAN DEFAULT FALSE,
      used_by VARCHAR(160),
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL
    );
  `;
  _rcReady = true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await ensureRc();

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, code, note, used, used_by, used_at, created_at, expires_at,
               (used = false AND expires_at > NOW()) AS active
        FROM admin_reset_codes ORDER BY created_at DESC LIMIT 200
      `;
      return res.status(200).json({ success: true, data: rows });
    }

    if (req.method === 'POST') {
      const action = req.body?.action;

      // ── Yerel sunucudan: kodu doğrula + TÜKET (tek kullanımlık) ──
      if (action === 'consume') {
        const code = String(req.body?.code || '').trim().toUpperCase();
        const usedBy = String(req.body?.cafe || '').slice(0, 160);
        if (!code) return res.status(400).json({ error: 'Kod gerekli.' });
        const { rows } = await sql`SELECT id, used, expires_at FROM admin_reset_codes WHERE code = ${code}`;
        if (!rows.length) return res.status(400).json({ error: 'Kod geçersiz.' });
        const c = rows[0];
        if (c.used) return res.status(400).json({ error: 'Kod zaten kullanılmış.' });
        if (new Date(c.expires_at) < new Date()) return res.status(400).json({ error: 'Kodun süresi dolmuş (1 saat).' });
        await sql`UPDATE admin_reset_codes SET used = true, used_by = ${usedBy || null}, used_at = NOW() WHERE id = ${c.id}`;
        return res.status(200).json({ success: true });
      }

      // ── Süperadmin: yeni kod üret ──
      const note = String(req.body?.note || '').slice(0, 255);
      const code = 'GC' + Math.random().toString(36).slice(2, 8).toUpperCase();
      await sql`
        INSERT INTO admin_reset_codes (code, note, expires_at)
        VALUES (${code}, ${note || null}, NOW() + INTERVAL '1 hour')
      `;
      return res.status(200).json({ success: true, code });
    }

    if (req.method === 'DELETE') {
      const id = req.body?.id;
      if (!id) return res.status(400).json({ error: 'id gerekli.' });
      await sql`DELETE FROM admin_reset_codes WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('reset-codes error:', error);
    return res.status(500).json({ error: error.message });
  }
}
