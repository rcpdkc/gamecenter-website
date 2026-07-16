import { sql } from '@vercel/postgres';
import { verifyToken } from './login.js';

// POST /api/me         → kullanıcı profil bilgisi
// GET  /api/me?view=logs → sistem logları (admin)
// DELETE /api/me?view=logs&id=X → log sil (admin)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ---- debug view ----
  if (req.query.view === 'debug') {
    const { email } = req.query;
    try {
      const user = email
        ? (await sql`SELECT id, email, cafe_name, cafe_id, hwid, role FROM users WHERE email = ${email} LIMIT 1`).rows[0]
        : null;
      const tel = (await sql`SELECT cafe_id, cafe_name, hwid, active_clients, last_updated FROM gamecenter_telemetry ORDER BY last_updated DESC`).rows;
      const matched = user ? tel.find(t => (user.cafe_id && t.cafe_id === user.cafe_id) || (user.hwid && t.hwid === user.hwid)) || null : null;
      return res.status(200).json({ user: user || null, telemetry_count: tel.length, telemetry: tel, matched, linked: !!matched });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  // ── Loglar ─────────────────────────────────────────────────────────────────
  if (req.query.view === 'logs') {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = token ? verifyToken(token) : null;
    if (!payload) return res.status(401).json({ error: 'Yetkisiz.' });

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS system_logs (
          id         SERIAL PRIMARY KEY,
          event      VARCHAR(100) NOT NULL,
          email      VARCHAR(255),
          details    TEXT,
          ip         VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      if (req.method === 'GET') {
        const { event, email, limit = 200 } = req.query;
        let rows;
        if (event && email) {
          rows = (await sql`SELECT * FROM system_logs WHERE event ILIKE ${'%' + event + '%'} AND email ILIKE ${'%' + email + '%'} ORDER BY created_at DESC LIMIT ${Number(limit)}`).rows;
        } else if (event) {
          rows = (await sql`SELECT * FROM system_logs WHERE event ILIKE ${'%' + event + '%'} ORDER BY created_at DESC LIMIT ${Number(limit)}`).rows;
        } else if (email) {
          rows = (await sql`SELECT * FROM system_logs WHERE email ILIKE ${'%' + email + '%'} ORDER BY created_at DESC LIMIT ${Number(limit)}`).rows;
        } else {
          rows = (await sql`SELECT * FROM system_logs ORDER BY created_at DESC LIMIT ${Number(limit)}`).rows;
        }
        return res.status(200).json({ success: true, data: rows });
      }

      if (req.method === 'DELETE') {
        if (payload.role !== 'admin') return res.status(403).json({ error: 'Sadece admin silebilir.' });
        const { id } = req.query;
        if (id) {
          await sql`DELETE FROM system_logs WHERE id = ${Number(id)}`;
        } else {
          await sql`DELETE FROM system_logs`;
        }
        return res.status(200).json({ success: true });
      }

      return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ── Profil bilgisi ─────────────────────────────────────────────────────────
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
