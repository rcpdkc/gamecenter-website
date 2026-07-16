import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'GET') {
    try {
      const { role, cafe_id } = request.query;

      let rows;
      if (role === 'admin') {
        const result = await sql`SELECT * FROM gamecenter_telemetry ORDER BY last_updated DESC`;
        rows = result.rows;
      } else if (cafe_id) {
        const result = await sql`SELECT * FROM gamecenter_telemetry WHERE cafe_id = ${cafe_id} ORDER BY last_updated DESC`;
        rows = result.rows;
      } else {
        return response.status(403).json({ error: 'Yetkisiz erişim.' });
      }

      const parsed = rows.map(row => ({
        ...row,
        top_games: typeof row.top_games === 'string' ? JSON.parse(row.top_games) : row.top_games,
        hardware_stats: typeof row.hardware_stats === 'string' ? JSON.parse(row.hardware_stats) : row.hardware_stats,
      }));

      return response.status(200).json({ success: true, data: parsed });
    } catch (error) {
      console.error('Get Telemetry Error:', error);
      return response.status(500).json({ error: error.message });
    }
  }

  if (request.method === 'POST') {
    try {
      const { cafe_id, cafe_name, active_clients, hardware_stats, top_games, hwid } = request.body;
      
      if (!cafe_id) {
         return response.status(400).json({ error: 'Missing cafe_id' });
      }
      
      // Create table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS gamecenter_telemetry (
          cafe_id VARCHAR(255) PRIMARY KEY,
          cafe_name VARCHAR(255),
          active_clients INT,
          hardware_stats JSONB,
          top_games JSONB,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      // Upsert telemetri verisini kaydet
      await sql`
        INSERT INTO gamecenter_telemetry (cafe_id, cafe_name, active_clients, hardware_stats, top_games, last_updated)
        VALUES (${cafe_id}, ${cafe_name}, ${active_clients || 0}, ${JSON.stringify(hardware_stats || {})}, ${JSON.stringify(top_games || {})}, NOW())
        ON CONFLICT (cafe_id) DO UPDATE SET 
          cafe_name = EXCLUDED.cafe_name,
          active_clients = EXCLUDED.active_clients,
          hardware_stats = EXCLUDED.hardware_stats,
          top_games = EXCLUDED.top_games,
          last_updated = NOW();
      `;

      // Setup olan server PC'nin HWID'sini users tablosuna da yaz
      // (cafe_id eşleşen kullanıcının HWID'si yoksa otomatik bağla)
      if (hwid) {
        await sql`
          UPDATE users
          SET hwid = ${hwid}
          WHERE cafe_id = ${cafe_id}
            AND (hwid IS NULL OR hwid = '')
        `;
      }
      
      return response.status(200).json({ success: true });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  return response.status(405).json({ error: 'Method Not Allowed' });
}
