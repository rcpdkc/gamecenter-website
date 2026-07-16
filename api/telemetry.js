import { sql } from '@vercel/postgres';

// ─── CORS helper ───────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ─── Schema: cafe_id PRIMARY KEY (orijinal), hwid ek kolon ────────────────
async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS gamecenter_telemetry (
      cafe_id        VARCHAR(255) PRIMARY KEY,
      cafe_name      VARCHAR(255),
      hwid           VARCHAR(255),
      active_clients INT DEFAULT 0,
      hardware_stats JSONB DEFAULT '{}',
      top_games      JSONB DEFAULT '[]',
      last_updated   TIMESTAMP DEFAULT NOW()
    );
  `;
  // Mevcut tabloya hwid kolonu ekle (yoksa)
  try { await sql`ALTER TABLE gamecenter_telemetry ADD COLUMN IF NOT EXISTS hwid VARCHAR(255)`; } catch (_) {}
}

// ─── GET /api/telemetry ─────────────────────────────────────────────────────
async function handleGet(request, response) {
  const { role, cafe_id } = request.query;

  let rows;
  if (role === 'admin') {
    // Admin: users tablosuyla JOIN — kayıtlı kafe ismi varsa onu göster
    const result = await sql`
      SELECT
        t.*,
        COALESCE(u.cafe_name, t.cafe_name) AS cafe_name,
        u.email      AS user_email,
        u.first_name AS user_first_name,
        u.last_name  AS user_last_name,
        u.phone      AS user_phone
      FROM gamecenter_telemetry t
      LEFT JOIN users u ON u.cafe_id = t.cafe_id
      WHERE t.last_updated >= NOW() - INTERVAL '90 days'
      ORDER BY t.last_updated DESC
    `;
    rows = result.rows;
  } else if (cafe_id) {
    // Kafe kullanıcısı: kendi verisi + gerçek kayıtlı isim
    const result = await sql`
      SELECT
        t.*,
        COALESCE(u.cafe_name, t.cafe_name) AS cafe_name
      FROM gamecenter_telemetry t
      LEFT JOIN users u ON u.cafe_id = t.cafe_id
      WHERE t.cafe_id = ${cafe_id}
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

  // ── HWID Deduplicate ───────────────────────────────────────────────────
  // Aynı HWID farklı cafe_id ile kayıtlıysa (DB sıfırlanmış kafe),
  // eski kaydı sil. Böylece tek fiziksel makine = tek kayıt.
  if (hwid) {
    await sql`
      DELETE FROM gamecenter_telemetry
      WHERE hwid = ${hwid}
        AND cafe_id != ${cafe_id};
    `;
  }

  // ── cafe_id üzerinden UPSERT (güvenilir, PRIMARY KEY çakışması olmaz) ──
  await sql`
    INSERT INTO gamecenter_telemetry
      (cafe_id, cafe_name, hwid, active_clients, hardware_stats, top_games, last_updated)
    VALUES
      (${cafe_id}, ${cafe_name}, ${hwid || null}, ${active_clients || 0},
       ${JSON.stringify(hardware_stats || {})}::jsonb,
       ${JSON.stringify(top_games || [])}::jsonb,
       NOW())
    ON CONFLICT (cafe_id) DO UPDATE SET
      cafe_name      = EXCLUDED.cafe_name,
      hwid           = COALESCE(EXCLUDED.hwid, gamecenter_telemetry.hwid),
      active_clients = EXCLUDED.active_clients,
      hardware_stats = EXCLUDED.hardware_stats,
      top_games      = EXCLUDED.top_games,
      last_updated   = NOW();
  `;

  // ── Otomatik cleanup: 30 günden eski sessiz kafeler ────────────────────
  await sql`
    DELETE FROM gamecenter_telemetry
    WHERE last_updated < NOW() - INTERVAL '30 days';
  `;

  // ── users tablosu: HWID + cafe_id senkronizasyonu ─────────────────────
  if (hwid) {
    // 1) Bu cafe_id'ye ait kullanıcının HWID'ini doldur (ilk bağlama)
    await sql`
      UPDATE users SET hwid = ${hwid}
      WHERE cafe_id = ${cafe_id}
        AND (hwid IS NULL OR hwid = '');
    `;

    // 2) KRİTİK: Bu HWID'e sahip kullanıcının cafe_id'sini güncelle.
    //    Kullanıcı kayıtta farklı cafe_id almışsa burada eşitlenir →
    //    kafe paneli artık doğru veriyi gösterir.
    await sql`
      UPDATE users SET cafe_id = ${cafe_id}
      WHERE hwid = ${hwid}
        AND hwid IS NOT NULL
        AND hwid != '';
    `;
  }

  return response.status(200).json({ success: true });
}

// ─── DELETE /api/telemetry?cafe_id=xxx  (admin only) ───────────────────────
async function handleDelete(request, response) {
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
