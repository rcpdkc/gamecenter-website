import { sql } from './_db.js';

// Sunucu Durumu KAYNAK master listesi — YÖNETİCİ (superadmin) bakımını yapar.
// Kafeler yerel panelden "Buluttan Çek" ile bu listeyi içe aktarır.
// ?action=status → her kaynağın canlı durumunu toplu çeker (premium görünüm için).
// cloud.js dispatcher üzerinden ?_svc=status-sources.

let _ready = false;
async function ensure() {
  if (_ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS game_status_sources (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      pub VARCHAR(120),
      url TEXT NOT NULL,
      sort INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  _ready = true;
}

const IND = {
  none: ['ok', 'Çalışıyor'], minor: ['warn', 'Küçük sorun'], major: ['down', 'Sorunlu'],
  critical: ['down', 'Ciddi kesinti'], maintenance: ['warn', 'Bakımda'],
};
async function fetchStatus(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(url.replace(/\/+$/, '') + '/api/v2/status.json', { signal: ctrl.signal, headers: { 'User-Agent': 'GameCenter-Status/1.0' } });
    clearTimeout(t);
    const j = await r.json();
    const ind = j?.status?.indicator || 'none';
    const m = IND[ind] || ['unknown', 'Bilinmiyor'];
    return { status: m[0], label: j?.status?.description || m[1] };
  } catch { return { status: 'unknown', label: 'Alınamadı' }; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await ensure();

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT id, name, pub, url FROM game_status_sources ORDER BY sort, id`;
      const list = rows.map(r => ({ id: r.id, name: r.name, pub: r.pub || '', url: r.url }));
      if (req.query?.action === 'status') {
        const games = await Promise.all(list.map(async s => ({ ...s, ...(await fetchStatus(s.url)) })));
        const down = games.filter(g => g.status === 'down').length;
        const warn = games.filter(g => g.status === 'warn').length;
        return res.status(200).json({ success: true, games, down, warn });
      }
      return res.status(200).json({ success: true, data: list });
    }

    if (req.method === 'POST') {
      const { name, pub, url } = req.body || {};
      if (!name || !url) return res.status(400).json({ error: 'Ad ve URL gerekli.' });
      await sql`INSERT INTO game_status_sources (name, pub, url) VALUES (${name}, ${pub || null}, ${String(url).replace(/\/+$/, '')})`;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id, name, pub, url } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id gerekli.' });
      await sql`UPDATE game_status_sources SET name=${name}, pub=${pub || null}, url=${String(url).replace(/\/+$/, '')} WHERE id=${id}`;
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id gerekli.' });
      await sql`DELETE FROM game_status_sources WHERE id=${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('status-sources:', e);
    return res.status(500).json({ error: e.message });
  }
}
