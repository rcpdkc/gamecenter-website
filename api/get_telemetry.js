import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (request.method === 'OPTIONS') return response.status(200).end();
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method Not Allowed' });

  try {
    // Get role and cafe_id from query params (sent by frontend/Python client)
    const { role, cafe_id } = request.query;

    let rows;
    if (role === 'admin') {
      // Admin sees ALL cafes
      const result = await sql`
        SELECT * FROM gamecenter_telemetry ORDER BY last_updated DESC
      `;
      rows = result.rows;
    } else if (cafe_id) {
      // Cafe user sees ONLY their own data
      const result = await sql`
        SELECT * FROM gamecenter_telemetry WHERE cafe_id = ${cafe_id} ORDER BY last_updated DESC
      `;
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
