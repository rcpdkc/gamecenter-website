import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const { rows } = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.cafe_name, u.role, 
             u.group_id, u.group_expires_at, u.cafe_id, u.created_at,
             g.name AS group_name, g.color AS group_color, g.permissions AS group_permissions
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.email = ${email}
    `;

    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = rows[0];
    const licenseExpired = user.role !== 'admin' && user.group_id && user.group_expires_at
      ? new Date(user.group_expires_at) < new Date()
      : false;

    return res.status(200).json({
      success: true,
      user: { ...user, license_expired: licenseExpired }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
