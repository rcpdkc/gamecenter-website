import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { user_id, hwid } = req.body;
    if (!user_id) return res.status(400).json({ error: 'Kullanıcı kimliği (user_id) zorunludur.' });

    // Set hwid to the provided value (null if we want to reset)
    await sql`UPDATE users SET hwid = ${hwid || null} WHERE id = ${user_id}`;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update HWID Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
