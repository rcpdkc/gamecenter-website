import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // Ensure table exists before querying
    await sql`
      CREATE TABLE IF NOT EXISTS reference_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const { rows } = await sql`
      SELECT id, email, code, is_used, created_at FROM reference_codes 
      ORDER BY created_at DESC
    `;
    
    return response.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Get References Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
