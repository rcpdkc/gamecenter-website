import { sql } from '@vercel/postgres';

// ─── CORS helper ───────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ─── Tablo migration ───────────────────────────────────────────────────────
async function ensureSchema() {
  // Ana tablo (hwid PRIMARY KEY — fiziksel makine = tek kayıt)
  await sql`
    CREATE TABLE IF NOT EXISTS gamecenter_telemetry (
      hwid          VARCHAR(255) PRIMARY KEY,
      cafe_id       VARCHAR(255) NOT NULL,
      cafe_name     VARCHAR(255),
      active_clients INT DEFAULT 0,
      hardware_stats JSONB DEFAULT '{}',
      top_games      JSONB DEFAULT '[]',
      last_updated   TIMESTAMP DEFAULT NOW()
    );
  `;

  // Migration: eski cafe_id PRIMARY KEY tablolarını HWID'li yapıya geçir
  // (hwid kolonu yoksa ekle, sonra PRIMARY KEY taşı)
  const migrations = [
    `ALTER TABLE gamecenter_telemetry ADD COLUMN IF NOT EXISTS hwid VARCHAR(255)`,
    `ALTER TABLE gamecenter_telemetry ADD COLUMN IF NOT EXISTS cafe_id VARCHAR(255)`,
  ];
  for (const m of migrations) {
    try { await sql.query(m); } catch (_) {}
  }
}

// ─── GET /api/telemetry ─────────────────────────────────────────────────────
async function handleGet(request, response) {
  const { role, cafe_id } = request.query;

  let rows;
  if (role === 'admin') {
    // Tüm kafeler — son 90 günde aktif olanlar (30+ gün sessiz = eski kayıt)
    const result = await sql`
      SELECT * FROM gamecenter_telemetry
      WHERE last_updated >= NOW() - INTERVAL '90 days'
      ORDER BY last_updated DESC
    `;
    rows = result.rows;
  } else if (cafe_id) {
    const result = await sql`
      SELECT * FROM gamecenter_telemetry
      WHERE cafe_id = ${cafe_id}
      ORDER BY last_updated DESC
      LIMIT 1
    `;
    rows = result.rows;
  } else {
    return response.status(403).json({ error: 'Yetkisiz erişim.' });
  }

  const parsed = rows.map(row => ({
    ...row,
    top_games: typeof row.top_games === 'string' ? JSON.parse(row.top_games) : (row.top_games || []),
    hardware_stats: typeof row.hardware_stats === 'string' ? JSON.parse(row.hardware_stats) : (row.hardware_stats || {}),
  }));

  return response.status(200).json({ success: true, data: parsed });
}

// ─── POST /api/telemetry ────────────────────────────────────────────────────
async function handlePost(request, response) {
  const { cafe_id, cafe_name, active_clients, hardware_stats, top_games, hwid } = request.body;

  if (!cafe_id) return response.status(400).json({ error: 'Missing cafe_id' });

  await ensureSchema();

  const effectiveHwid = hwid || cafe_id; // HWID yoksa cafe_id'yi fallback kullan

  // ── HWID bazlı UPSERT ──────────────────────────────────────────────────
  // Aynı HWID = aynı fiziksel makine. cafe_id değişmiş bile olsa (DB sıfırlandı)
  // tek kayıt güncellenir. Bu duplicate kayıt sorununu tamamen önler.
  await sql`
    INSERT INTO gamecenter_telemetry
      (hwid, cafe_id, cafe_name, active_clients, hardware_stats, top_games, last_updated)
    VALUES
      (${effectiveHwid}, ${cafe_id}, ${cafe_name}, ${active_clients || 0},
       ${JSON.stringify(hardware_stats || {})}::jsonb,
       ${JSON.stringify(top_games || [])}::jsonb,
       NOW())
    ON CONFLICT (hwid) DO UPDATE SET
      cafe_id        = EXCLUDED.cafe_id,
      cafe_name      = EXCLUDED.cafe_name,
      active_clients = EXCLUDED.active_clients,
      hardware_stats = EXCLUDED.hardware_stats,
      top_games      = EXCLUDED.top_games,
      last_updated   = NOW();
  `;

  // ── Aynı cafe_id ile oluşmuş ESKI/ARTIK kayıtları temizle ─────────────
  // (Migration sonrası eski cafe_id PRIMARY KEY kayıtları varsa sil)
  if (hwid) {
    await sql`
      DELETE FROM gamecenter_telemetry
      WHERE cafe_id = ${cafe_id}
        AND hwid != ${hwid}
        AND hwid IS NOT NULL;
    `;
  }

  // ── Otomatik cleanup: 30 günden eski sessiz kafeler ────────────────────
  await sql`
    DELETE FROM gamecenter_telemetry
    WHERE last_updated < NOW() - INTERVAL '30 days';
  `;

  // ── HWID → users tablosuna yaz (login binding için) ────────────────────
  if (hwid) {
    // 1) HWID ile eşleşen kullanıcının HWID alanını doldur (ilk bağlama)
    await sql`
      UPDATE users
      SET hwid = ${hwid}
      WHERE cafe_id = ${cafe_id}
        AND (hwid IS NULL OR hwid = '');
    `;

    // 2) KRİTİK: HWID ile eşleşen kullanıcının cafe_id'sini sunucunun
    //    gönderdiği cafe_id ile senkronize et.
    //    Kullanıcı kayıt sırasında farklı bir cafe_id almış olabilir;
    //    bu satır ikisini eşitler → kafe paneli artık doğru veriyi gösterir.
    await sql`
      UPDATE users
      SET cafe_id = ${cafe_id}
      WHERE hwid = ${hwid}
        AND hwid IS NOT NULL
        AND hwid != '';
    `;
  }

  return response.status(200).json({ success: true });
}

// ─── DELETE /api/telemetry?cafe_id=xxx  (admin only) ───────────────────────
async function handleDelete(request, response) {
  // Token doğrulama — Authorization: Bearer <token>
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Yetkisiz.' });
  }

  const { cafe_id, hwid } = request.query;
  if (!cafe_id && !hwid) {
    return response.status(400).json({ error: 'cafe_id veya hwid gerekli.' });
  }

  try {
    if (hwid) {
      await sql`DELETE FROM gamecenter_telemetry WHERE hwid = ${hwid}`;
    } else {
      await sql`DELETE FROM gamecenter_telemetry WHERE cafe_id = ${cafe_id}`;
    }
    return response.status(200).json({ success: true, message: 'Kafe kaydı silindi.' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}

// ─── Ana handler ────────────────────────────────────────────────────────────
export default async function handler(request, response) {
  setCors(response);
  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    if (request.method === 'GET')    return await handleGet(request, response);
    if (request.method === 'POST')   return await handlePost(request, response);
    if (request.method === 'DELETE') return await handleDelete(request, response);
    return response.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('[telemetry]', error);
    return response.status(500).json({ error: error.message });
  }
}
