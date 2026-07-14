import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { email } = request.body;
    
    if (!email) {
       return response.status(400).json({ error: 'Referans oluşturulacak e-posta adresi zorunludur.' });
    }
    
    // Create reference_codes table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS reference_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Generate a random 8-character reference code (e.g. GC-A1B2C3D4)
    const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
    const code = `GC-${randomString}`;
    
    await sql`
      INSERT INTO reference_codes (email, code)
      VALUES (${email}, ${code})
    `;
    
    return response.status(200).json({ success: true, code, email });

  } catch (error) {
    console.error("Create Reference Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
