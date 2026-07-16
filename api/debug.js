import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { email } = req.query;

  try {
    // Kullanıcı durumu
    const user = email
      ? (await sql`SELECT id, email, cafe_name, cafe_id, hwid, role FROM users WHERE email = ${email} LIMIT 1`).rows[0]
      : null;

    // Tüm telemetri kayıtları
    const telemetry = (await sql`SELECT cafe_id, cafe_name, hwid, active_clients, last_updated FROM gamecenter_telemetry ORDER BY last_updated DESC`).rows;

    // Email ile eşleşen telemetri kaydı (cafe_id veya hwid üzerinden)
    let matchedByField = null;
    if (user) {
      matchedByField = telemetry.find(t =>
        (user.cafe_id && t.cafe_id === user.cafe_id) ||
        (user.hwid && t.hwid === user.hwid)
      ) || null;
    }

    return res.status(200).json({
      user,
      telemetry_count: telemetry.length,
      telemetry_records: telemetry,
      matched: matchedByField,
      diagnosis: user ? {
        has_cafe_id: !!user.cafe_id,
        has_hwid: !!user.hwid,
        will_find_data: !!matchedByField,
        fix_needed: !matchedByField ? 'Hesap Bagla ile telemetri kaydını bağlayın' : 'Veri bulundu, sorun başka'
      } : 'Kullanıcı bulunamadı'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
