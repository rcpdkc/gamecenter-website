import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { rows } = await sql`
      SELECT u.id, u.first_name, u.last_name, u.email, u.cafe_name, u.phone,
             u.role, u.group_id, u.group_expires_at, u.cafe_id, u.created_at, u.hwid,
             g.name AS group_name, g.color AS group_color
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.role != 'admin'
      ORDER BY u.created_at DESC
    `;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
