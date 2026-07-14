import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // Ensure table exists before querying or inserting
    await sql`
      CREATE TABLE IF NOT EXISTS reference_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    if (request.method === 'GET') {
      const { rows } = await sql`
        SELECT id, email, code, is_used, created_at FROM reference_codes 
        ORDER BY created_at DESC
      `;
      return response.status(200).json({ success: true, data: rows });
    }
    
    else if (request.method === 'POST') {
      const { email } = request.body;
      if (!email) return response.status(400).json({ error: 'Referans oluşturulacak e-posta adresi zorunludur.' });
      
      const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
      const code = `GC-${randomString}`;
      
      await sql`INSERT INTO reference_codes (email, code) VALUES (${email}, ${code})`;
      return response.status(200).json({ success: true, code, email });
    }
    
    else if (request.method === 'DELETE') {
      const { id } = request.body;
      if (!id) return response.status(400).json({ error: 'ID is required' });
      await sql`DELETE FROM reference_codes WHERE id = ${id}`;
      return response.status(200).json({ success: true });
    }
    
    else {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("References API Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
