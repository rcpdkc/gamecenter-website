import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { rows } = await sql`SELECT * FROM gamecenter_telemetry ORDER BY last_updated DESC;`;
    return response.status(200).json({ data: rows });
  } catch (error) {
    if (error.message.includes('does not exist')) {
       return response.status(200).json({ data: [] });
    }
    return response.status(500).json({ error: error.message });
  }
}
