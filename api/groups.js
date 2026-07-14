import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const method = req.method;
  try {
    await sql`CREATE TABLE IF NOT EXISTS groups (
      id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT, color VARCHAR(30) DEFAULT '#f97316',
      permissions JSON DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    if (method === 'GET') {
      const { rows } = await sql`
        SELECT g.*, COUNT(u.id)::int AS member_count
        FROM groups g
        LEFT JOIN users u ON u.group_id = g.id
        GROUP BY g.id ORDER BY g.created_at DESC
      `;
      return res.status(200).json({ success: true, data: rows });
    }

    if (method === 'POST') {
      const { name, description, color, permissions } = req.body;
      if (!name) return res.status(400).json({ error: 'Grup adı zorunludur.' });
      const { rows } = await sql`
        INSERT INTO groups (name, description, color, permissions)
        VALUES (${name}, ${description || ''}, ${color || '#f97316'}, ${JSON.stringify(permissions || [])})
        RETURNING *
      `;
      return res.status(200).json({ success: true, data: rows[0] });
    }

    if (method === 'PUT') {
      const { id, name, description, color, permissions } = req.body;
      if (!id || !name) return res.status(400).json({ error: 'id ve name zorunludur.' });
      await sql`UPDATE groups SET name=${name}, description=${description||''}, color=${color||'#f97316'}, permissions=${JSON.stringify(permissions || [])} WHERE id=${id}`;
      return res.status(200).json({ success: true });
    }

    if (method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id zorunludur.' });
      await sql`UPDATE users SET group_id = NULL WHERE group_id = ${id}`;
      await sql`DELETE FROM groups WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Groups Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
