import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    if (request.method === 'GET') {
      const { rows } = await sql`
        SELECT id, title, message, link, created_at FROM announcements 
        ORDER BY created_at DESC
        LIMIT 10
      `;
      return response.status(200).json({ success: true, data: rows });
    }
    else if (request.method === 'POST') {
      const { title, message, link } = request.body;
      if (!title || !message) return response.status(400).json({ error: 'Başlık ve mesaj zorunludur.' });
      
      await sql`
        INSERT INTO announcements (title, message, link) 
        VALUES (${title}, ${message}, ${link || null})
      `;
      
      return response.status(200).json({ success: true, message: 'Duyuru başarıyla yayınlandı.' });
    }
    else {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("Announcements API Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
