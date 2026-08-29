// Popüler online oyunların sunucu durumu — BULUT aggregator.
// Resmi "Statuspage" (Atlassian) kullanan servisler /api/v2/status.json ile GERÇEK durum verir.
// Riot/Steam/EA/Rockstar gibi kendi sistemini kullananlar için kaynak sonradan (yalnız burada) eklenir.
// Oyun listesi + kaynaklar TEK YERDE (bu dosya) → değişince tüm kafeler otomatik alır.

const GAMES = [
  { id: 'fortnite',  name: 'Fortnite',            pub: 'Epic Games', sp: 'https://status.epicgames.com' },
  { id: 'rocketleague', name: 'Rocket League',    pub: 'Epic Games', sp: 'https://status.epicgames.com' },
  { id: 'fallguys',  name: 'Fall Guys',           pub: 'Epic Games', sp: 'https://status.epicgames.com' },
  { id: 'roblox',    name: 'Roblox',              pub: 'Roblox',     sp: 'https://status.roblox.com' },
  { id: 'discord',   name: 'Discord (Sesli)',     pub: 'Discord',    sp: 'https://discordstatus.com' },
  { id: 'valorant',  name: 'Valorant',            pub: 'Riot Games', soon: true },
  { id: 'lol',       name: 'League of Legends',   pub: 'Riot Games', soon: true },
  { id: 'cs2',       name: 'Counter-Strike 2',    pub: 'Valve',      soon: true },
  { id: 'dota2',     name: 'Dota 2',              pub: 'Valve',      soon: true },
  { id: 'gtao',      name: 'GTA V Online',        pub: 'Rockstar',   soon: true },
  { id: 'apex',      name: 'Apex Legends',        pub: 'EA',         soon: true },
  { id: 'pubg',      name: 'PUBG: BATTLEGROUNDS', pub: 'Krafton',    soon: true },
];

const IND = {
  none:        { status: 'ok',      label: 'Çalışıyor' },
  minor:       { status: 'warn',    label: 'Küçük sorun' },
  major:       { status: 'down',    label: 'Sorunlu' },
  critical:    { status: 'down',    label: 'Ciddi kesinti' },
  maintenance: { status: 'warn',    label: 'Bakımda' },
};

async function fetchJson(url, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'GameCenter-Status/1.0' } });
    if (!r.ok) throw new Error('http ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

async function checkGame(g) {
  if (g.soon) return { status: 'unknown', label: 'Kaynak yakında' };
  if (g.sp) {
    try {
      const j = await fetchJson(g.sp + '/api/v2/status.json');
      const ind = j.status?.indicator || 'none';
      const m = IND[ind] || { status: 'unknown', label: 'Bilinmiyor' };
      return { status: m.status, label: j.status?.description || m.label };
    } catch {
      return { status: 'unknown', label: 'Alınamadı' };
    }
  }
  return { status: 'unknown', label: 'Bilinmiyor' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // edge'de 5 dk cache
  if (req.method === 'OPTIONS') return res.status(200).end();

  const games = await Promise.all(GAMES.map(async (g) => ({
    id: g.id, name: g.name, pub: g.pub, ...(await checkGame(g)),
  })));

  const down = games.filter(x => x.status === 'down').length;
  const warn = games.filter(x => x.status === 'warn').length;
  res.status(200).json({ ok: true, games, down, warn, fetched_at: new Date().toISOString() });
}
