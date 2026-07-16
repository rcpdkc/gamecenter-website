import { sql } from '@vercel/postgres';

// Admin: Kafe kullanıcılarını ve telemetri kayıtlarını listele / bağla
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Token doğrulama
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkisiz.' });
  }

  // ─── GET: Tüm kafe kullanıcıları + bağlı telemetri durumu ─────────────────
  if (req.method === 'GET') {
    try {
      // Tüm kafe kullanıcıları
      const users = await sql`
        SELECT id, email, cafe_name, cafe_id, hwid, role, created_at
        FROM users
        WHERE role = 'cafe'
        ORDER BY created_at DESC
      `;

      // Tüm aktif telemetri kayıtları
      const telemetry = await sql`
        SELECT cafe_id, cafe_name, hwid, active_clients, last_updated
        FROM gamecenter_telemetry
        WHERE last_updated >= NOW() - INTERVAL '90 days'
        ORDER BY last_updated DESC
      `;

      // Her kullanıcı için telemetri eşleşmesini işaretle
      const enriched = users.rows.map(u => {
        const linked = telemetry.rows.find(t => t.cafe_id === u.cafe_id);
        return {
          ...u,
          is_linked: !!linked,
          linked_telemetry: linked || null,
        };
      });

      return res.status(200).json({
        success: true,
        users: enriched,
        telemetry_records: telemetry.rows,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ─── POST: Kullanıcıyı telemetri kaydına bağla ────────────────────────────
  if (req.method === 'POST') {
    const { user_email, telemetry_cafe_id } = req.body;
    if (!user_email || !telemetry_cafe_id) {
      return res.status(400).json({ error: 'user_email ve telemetry_cafe_id gerekli.' });
    }

    try {
      // Telemetri kaydını bul
      const tResult = await sql`
        SELECT cafe_id, cafe_name, hwid FROM gamecenter_telemetry
        WHERE cafe_id = ${telemetry_cafe_id} LIMIT 1
      `;
      if (!tResult.rows[0]) {
        return res.status(404).json({ error: 'Telemetri kaydı bulunamadı.' });
      }
      const tel = tResult.rows[0];

      // Kullanıcının cafe_id'sini telemetri ile eşleştir
      await sql`
        UPDATE users
        SET
          cafe_id = ${tel.cafe_id},
          hwid    = COALESCE(NULLIF(hwid, ''), ${tel.hwid || null})
        WHERE email = ${user_email}
      `;

      return res.status(200).json({
        success: true,
        message: `${user_email} → ${tel.cafe_name} (${tel.cafe_id}) bağlandı.`,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
