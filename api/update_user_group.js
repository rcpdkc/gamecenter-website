import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { user_id, group_id, group_expires_at } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id zorunludur.' });
    const expiresAt = group_id && group_expires_at ? group_expires_at : null;
    const gid = group_id || null;
    await sql`UPDATE users SET group_id = ${gid}, group_expires_at = ${expiresAt} WHERE id = ${user_id}`;
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
