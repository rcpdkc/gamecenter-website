import { sql } from './_db.js';

// Sunucu Durumu KAYNAK master listesi — YÖNETİCİ (superadmin) bakımını yapar.
// Kafeler yerel panelden "Buluttan Çek" ile içe aktarır. ?action=status → canlı durum.
// TÜR (type):
//   'statuspage' → Atlassian Statuspage URL'i (/api/v2/status.json) OTOMATİK durum.
//   'manual'     → API yok; durumu ADMIN elle ayarlar (manual_status: ok|warn|down).
// Her şey sonradan düzenlenebilir (ad/yayıncı/tür/URL/durum).

let _ready = false;

// İlk kurulumda popüler oyunlar (Statuspage'i olan → otomatik; olmayan → manuel/ok)
const SEED = [
  ['Fortnite', 'Epic Games', 'statuspage', 'https://status.epicgames.com', 'ok'],
  ['Rocket League', 'Epic Games', 'statuspage', 'https://status.epicgames.com', 'ok'],
  ['Fall Guys', 'Epic Games', 'statuspage', 'https://status.epicgames.com', 'ok'],
  ['Roblox', 'Roblox', 'statuspage', 'https://status.roblox.com', 'ok'],
  ['Discord', 'Discord', 'statuspage', 'https://discordstatus.com', 'ok'],
  ['Valorant', 'Riot Games', 'manual', '', 'ok'],
  ['League of Legends', 'Riot Games', 'manual', '', 'ok'],
  ['Counter-Strike 2', 'Valve', 'manual', '', 'ok'],
  ['Dota 2', 'Valve', 'manual', '', 'ok'],
  ['Steam', 'Valve', 'manual', '', 'ok'],
  ['GTA V Online', 'Rockstar', 'manual', '', 'ok'],
  ['Apex Legends', 'EA', 'manual', '', 'ok'],
  ['PUBG: BATTLEGROUNDS', 'Krafton', 'manual', '', 'ok'],
  ['Call of Duty: Warzone', 'Activision', 'manual', '', 'ok'],
  ['Minecraft', 'Mojang', 'manual', '', 'ok'],
  ['Overwatch 2', 'Blizzard', 'manual', '', 'ok'],
  ['Genshin Impact', 'HoYoverse', 'manual', '', 'ok'],
];

async function ensure() {
  if (_ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS game_status_sources (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      pub VARCHAR(120),
      type VARCHAR(20) DEFAULT 'statuspage',
      url TEXT,
      manual_status VARCHAR(10) DEFAULT 'ok',
      sort INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try { await sql`ALTER TABLE game_status_sources ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'statuspage'`; } catch { /* */ }
  try { await sql`ALTER TABLE game_status_sources ADD COLUMN IF NOT EXISTS manual_status VARCHAR(10) DEFAULT 'ok'`; } catch { /* */ }
  try { await sql`ALTER TABLE game_status_sources ALTER COLUMN url DROP NOT NULL`; } catch { /* */ }
  // Boşsa popüler oyunlarla doldur — TEK toplu INSERT (yavaş pooler'da timeout olmasin)
  try {
    const { rows } = await sql`SELECT COUNT(*)::int AS n FROM game_status_sources`;
    if (rows[0].n === 0) {
      const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
      const vals = SEED.map(([name, pub, type, url, ms], i) =>
        `(${esc(name)},${esc(pub)},${esc(type)},${url ? esc(url) : 'NULL'},${esc(ms)},${i})`).join(',');
      await sql.query(`INSERT INTO game_status_sources (name, pub, type, url, manual_status, sort) VALUES ${vals}`);
    }
  } catch (e) { console.error('seed:', e && e.message); }
  _ready = true;
}

const IND = {
  none: ['ok', 'Çalışıyor'], minor: ['warn', 'Küçük sorun'], major: ['down', 'Sorunlu'],
  critical: ['down', 'Ciddi kesinti'], maintenance: ['warn', 'Bakımda'],
};
const MANUAL_LABEL = { ok: 'Çalışıyor', warn: 'Sorun (elle)', down: 'Kesinti (elle)' };

async function statusOf(s) {
  if (s.type === 'manual') {
    const st = ['ok', 'warn', 'down'].includes(s.manual_status) ? s.manual_status : 'unknown';
    return { status: st, label: MANUAL_LABEL[st] || 'Bilinmiyor' };
  }
  const url = (s.url || '').replace(/\/+$/, '');
  if (!url) return { status: 'unknown', label: 'Kaynak yok' };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(url + '/api/v2/status.json', { signal: ctrl.signal, headers: { 'User-Agent': 'GameCenter-Status/1.0' } });
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
      const { rows } = await sql`SELECT id, name, pub, type, url, manual_status FROM game_status_sources ORDER BY sort, id`;
      const list = rows.map(r => ({ id: r.id, name: r.name, pub: r.pub || '', type: r.type || 'statuspage', url: r.url || '', manual_status: r.manual_status || 'ok' }));
      if (req.query?.action === 'status') {
        const games = await Promise.all(list.map(async s => ({ id: s.id, name: s.name, pub: s.pub, type: s.type, ...(await statusOf(s)) })));
        const down = games.filter(g => g.status === 'down').length;
        const warn = games.filter(g => g.status === 'warn').length;
        return res.status(200).json({ success: true, games, down, warn });
      }
      return res.status(200).json({ success: true, data: list });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const b = req.body || {};
      const name = (b.name || '').trim();
      const type = b.type === 'manual' ? 'manual' : 'statuspage';
      const url = type === 'statuspage' ? String(b.url || '').trim().replace(/\/+$/, '') : '';
      const ms = ['ok', 'warn', 'down'].includes(b.manual_status) ? b.manual_status : 'ok';
      if (!name) return res.status(400).json({ error: 'Ad gerekli.' });
      if (type === 'statuspage' && !url) return res.status(400).json({ error: 'Statuspage türü için URL gerekli.' });
      if (req.method === 'POST') {
        await sql`INSERT INTO game_status_sources (name, pub, type, url, manual_status) VALUES (${name}, ${b.pub || null}, ${type}, ${url || null}, ${ms})`;
      } else {
        if (!b.id) return res.status(400).json({ error: 'id gerekli.' });
        await sql`UPDATE game_status_sources SET name=${name}, pub=${b.pub || null}, type=${type}, url=${url || null}, manual_status=${ms} WHERE id=${b.id}`;
      }
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
