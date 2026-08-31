import { sql, client } from './_db.js';

// Sunucu Durumu KAYNAK master listesi — YÖNETİCİ (superadmin) bakımını yapar.
// ?action=status → canlı durum (GERÇEK sağlayıcı API'leri). ?action=reseed → listeyi sıfırla+doldur.
// TÜR: 'statuspage' (Atlassian /api/v2/status.json) | 'riot' (Riot status json) |
//      'steam' (steamstat.us) | 'manual' (API yok → admin elle).

let _ready = false;

// url alanı: statuspage=base URL · riot=Riot status json URL · steam=gravity.json · manual=boş
const SEED = [
  ['Fortnite', 'Epic Games', 'statuspage', 'https://status.epicgames.com', 'ok'],
  ['Rocket League', 'Epic Games', 'statuspage', 'https://status.epicgames.com', 'ok'],
  ['Fall Guys', 'Epic Games', 'statuspage', 'https://status.epicgames.com', 'ok'],
  ['Discord', 'Discord', 'statuspage', 'https://discordstatus.com', 'ok'],
  ['Valorant', 'Riot Games', 'riot', 'https://valorant.secure.dyn.riotcdn.net/channels/public/x/status/eu.json', 'ok'],
  ['League of Legends', 'Riot Games', 'riot', 'https://lol.secure.dyn.riotcdn.net/channels/public/x/status/euw1.json', 'ok'],
  // steam_players: url = Steam appid → GERÇEK canlı oyuncu sayısı (key'siz)
  ['Counter-Strike 2', 'Valve', 'steam_players', '730', 'ok'],
  ['Dota 2', 'Valve', 'steam_players', '570', 'ok'],
  ['PUBG: BATTLEGROUNDS', 'Krafton', 'steam_players', '578080', 'ok'],
  ['Apex Legends', 'EA', 'steam_players', '1172470', 'ok'],
  ['GTA V', 'Rockstar', 'steam_players', '271590', 'ok'],
  ['Call of Duty', 'Activision', 'steam_players', '1938090', 'ok'],
  ['Overwatch 2', 'Blizzard', 'steam_players', '2357570', 'ok'],
  ['Rust', 'Facepunch', 'steam_players', '252490', 'ok'],
  ['Team Fortress 2', 'Valve', 'steam_players', '440', 'ok'],
  ['Genshin Impact', 'HoYoverse', 'manual', '', 'ok'],
];

function seedSql() {
  const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
  const vals = SEED.map(([name, pub, type, url, ms], i) =>
    `(${esc(name)},${esc(pub)},${esc(type)},${url ? esc(url) : 'NULL'},${esc(ms)},${i})`).join(',');
  return `INSERT INTO status_sources (name, pub, type, url, manual_status, sort) VALUES ${vals}`;
}

// ATOMIK seed: DELETE+INSERT tek transaction → timeout/kesinti olursa geri alinir,
// tablo ASLA yari-bos kalmaz (onceki 'kaynak:0' hatasinin koku buydu).
async function doSeed(replace) {
  await client.begin(async (tx) => {
    if (replace) await tx.unsafe('DELETE FROM status_sources');
    await tx.unsafe(seedSql());
  });
}

async function ensure() {
  if (_ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS status_sources (
      id SERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, pub VARCHAR(120),
      type VARCHAR(20) DEFAULT 'statuspage', url TEXT, manual_status VARCHAR(10) DEFAULT 'ok',
      sort INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const { rows } = await sql`SELECT COUNT(*)::int AS n FROM status_sources`;
    if (rows[0].n === 0) await doSeed(false);
  } catch (e) { console.error('seed:', e && e.message); }
  _ready = true;
}

async function fetchJson(url, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'GameCenter-Status/1.0' } });
    return await r.json();
  } finally { clearTimeout(t); }
}

const IND = { none: ['ok', 'Çalışıyor'], minor: ['warn', 'Küçük sorun'], major: ['down', 'Sorunlu'], critical: ['down', 'Ciddi kesinti'], maintenance: ['warn', 'Bakımda'] };
const MANUAL_LABEL = { ok: 'Çalışıyor', warn: 'Sorun (elle)', down: 'Kesinti (elle)' };

// Riot çok-dilli metinlerden tr_TR (yoksa en_US) seçer
const pickLocale = (arr) => {
  const m = Object.fromEntries((arr || []).map(t => [t.locale, t.content]));
  return m.tr_TR || m.en_US || (arr && arr[0] && arr[0].content) || '';
};

async function statusOf(s) {
  const url = (s.url || '').replace(/\/+$/, '');
  try {
    if (s.type === 'manual') {
      const st = ['ok', 'warn', 'down'].includes(s.manual_status) ? s.manual_status : 'unknown';
      return { status: st, label: MANUAL_LABEL[st] || 'Bilinmiyor' };
    }
    if (s.type === 'riot') {
      if (!url) return { status: 'unknown', label: 'Kaynak yok' };
      const j = await fetchJson(url);
      const inc = j?.incidents || []; const mnt = j?.maintenances || [];
      if (!inc.length && !mnt.length) return { status: 'ok', label: 'Çalışıyor' };
      const onlyMnt = !inc.length && mnt.length;
      const items = inc.length ? inc : mnt;
      const first = items[0] || {};
      const title = pickLocale(first.titles);                                   // ör: "Oyun Sunucusu Devre Dışı"
      const upd = pickLocale((first.updates && first.updates[0] && first.updates[0].translations) || []); // ör: "Dubai ..."
      const extra = items.length > 1 ? ` +${items.length - 1}` : '';
      const detail = (title || (onlyMnt ? 'Planlı bakım' : 'Sorun')) + (upd ? ' — ' + upd : '') + extra;
      const crit = inc.some(x => String(x.incident_severity || '').toLowerCase() === 'critical');
      return { status: crit ? 'down' : 'warn', label: onlyMnt ? 'Bakım' : crit ? 'Kesinti' : 'Sorun', detail };
    }
    if (s.type === 'steam_players') {
      // url = Steam appid → resmi Valve API (key'siz) → GERÇEK canlı oyuncu sayısı
      const appid = String(s.url || '').trim();
      if (!appid) return { status: 'unknown', label: 'AppID yok' };
      const j = await fetchJson(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`);
      const cnt = j?.response?.player_count;
      if (j?.response?.result === 1 && typeof cnt === 'number') {
        const fmt = cnt >= 1e6 ? (cnt / 1e6).toFixed(1) + 'M' : cnt >= 1000 ? Math.round(cnt / 1000) + 'K' : String(cnt);
        return cnt > 0 ? { status: 'ok', label: `${fmt} çevrimiçi` } : { status: 'warn', label: 'Oyuncu yok' };
      }
      return { status: 'unknown', label: 'Alınamadı' };
    }
    if (s.type === 'steam') {
      const j = await fetchJson('https://crowbar.steamstat.us/gravity.json');
      const svc = Object.values(j?.services || {}).map(v => String(v).toLowerCase());
      if (!svc.length) return { status: 'unknown', label: 'Bilinmiyor' };
      if (svc.some(v => v.includes('down') || v === 'offline' || v === 'major')) return { status: 'down', label: 'Kesinti' };
      if (svc.some(v => v.includes('slow') || v.includes('delayed') || v === 'surge' || v === 'minor')) return { status: 'warn', label: 'Yavaş/Sorun' };
      return { status: 'ok', label: 'Çalışıyor' };
    }
    // statuspage — summary.json hem durumu hem AÇIK arıza başlıklarını verir
    if (!url) return { status: 'unknown', label: 'Kaynak yok' };
    const j = await fetchJson(url + '/api/v2/summary.json');
    const ind = j?.status?.indicator || 'none';
    const m = IND[ind] || ['unknown', 'Bilinmiyor'];
    const incs = (j?.incidents || []).filter(i => i.status && i.status !== 'resolved' && i.status !== 'postmortem');
    if (incs.length) {
      const body = (incs[0]?.incident_updates?.[0]?.body || '').trim().slice(0, 180);
      const st = m[0] === 'ok' ? 'warn' : m[0];
      const extra = incs.length > 1 ? ` +${incs.length - 1}` : '';
      return { status: st, label: st === 'down' ? 'Kesinti' : 'Sorun', detail: (incs[0].name || 'Sorun') + (body ? ' — ' + body : '') + extra };
    }
    return { status: m[0], label: m[1] };
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
      // Mevcut listeyi doğru kaynaklarla sıfırla+doldur (bir kez çağrılır)
      if (req.query?.action === 'reseed') {
        await doSeed(true);
        return res.status(200).json({ success: true, message: 'reseeded', count: SEED.length });
      }
      const { rows } = await sql`SELECT id, name, pub, type, url, manual_status FROM status_sources ORDER BY sort, id`;
      const list = rows.map(r => ({ id: r.id, name: r.name, pub: r.pub || '', type: r.type || 'statuspage', url: r.url || '', manual_status: r.manual_status || 'ok' }));
      if (req.query?.action === 'status') {
        const games = await Promise.all(list.map(async s => ({ id: s.id, name: s.name, pub: s.pub, type: s.type, ...(await statusOf(s)) })));
        return res.status(200).json({ success: true, games, down: games.filter(g => g.status === 'down').length, warn: games.filter(g => g.status === 'warn').length });
      }
      return res.status(200).json({ success: true, data: list });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const b = req.body || {};
      const name = (b.name || '').trim();
      const type = ['statuspage', 'riot', 'steam', 'steam_players', 'manual'].includes(b.type) ? b.type : 'statuspage';
      const url = type === 'manual' ? '' : String(b.url || '').trim().replace(/\/+$/, '');
      const ms = ['ok', 'warn', 'down'].includes(b.manual_status) ? b.manual_status : 'ok';
      if (!name) return res.status(400).json({ error: 'Ad gerekli.' });
      if ((type === 'statuspage' || type === 'riot' || type === 'steam_players') && !url) return res.status(400).json({ error: 'Bu tür için URL/AppID gerekli.' });
      if (req.method === 'POST') {
        await sql`INSERT INTO status_sources (name, pub, type, url, manual_status) VALUES (${name}, ${b.pub || null}, ${type}, ${url || null}, ${ms})`;
      } else {
        if (!b.id) return res.status(400).json({ error: 'id gerekli.' });
        await sql`UPDATE status_sources SET name=${name}, pub=${b.pub || null}, type=${type}, url=${url || null}, manual_status=${ms} WHERE id=${b.id}`;
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id gerekli.' });
      await sql`DELETE FROM status_sources WHERE id=${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    console.error('status-sources:', e);
    return res.status(500).json({ error: e.message });
  }
}
