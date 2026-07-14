import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const method = req.method;

  try {
    // Ensure table
    await sql`CREATE TABLE IF NOT EXISTS covers (
      id SERIAL PRIMARY KEY, game_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL, uploaded_by_id INTEGER,
      uploaded_by_role VARCHAR(50), cafe_id VARCHAR(100),
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    if (method === 'GET') {
      const { role, cafe_id } = req.query;
      let rows;
      if (role === 'admin') {
        const r = await sql`SELECT * FROM covers ORDER BY created_at DESC`;
        rows = r.rows;
      } else if (cafe_id) {
        const r = await sql`SELECT * FROM covers WHERE cafe_id = ${cafe_id} OR status = 'approved' ORDER BY created_at DESC`;
        rows = r.rows;
      } else {
        const r = await sql`SELECT * FROM covers WHERE status = 'approved' ORDER BY created_at DESC`;
        rows = r.rows;
      }
      return res.status(200).json({ success: true, data: rows });
    }

    if (method === 'PATCH') {
      // Update status or game_name
      const { id, status, game_name } = req.body;
      if (!id) return res.status(400).json({ error: 'id zorunludur.' });
      
      if (status && game_name) {
        await sql`UPDATE covers SET status = ${status}, game_name = ${game_name} WHERE id = ${id}`;
      } else if (status) {
        await sql`UPDATE covers SET status = ${status} WHERE id = ${id}`;
      } else if (game_name) {
        await sql`UPDATE covers SET game_name = ${game_name} WHERE id = ${id}`;
      }
      
      return res.status(200).json({ success: true });
    }

    if (method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id zorunludur.' });
      // Get URL to delete from blob too (optional)
      await sql`DELETE FROM covers WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Covers API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
