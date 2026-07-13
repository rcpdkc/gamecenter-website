import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  // CORS Headers for Python client
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { cafe_id, cafe_name, active_clients, hardware_stats, top_games } = request.body;
    
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
    
    // Upsert the data
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
    
    return response.status(200).json({ success: true });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
