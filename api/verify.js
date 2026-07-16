import { sql } from '@vercel/postgres';
import { verifyToken } from './login.js';

// /api/verify — Token doğrulama endpoint'i
// Frontend her sayfa açılışında bunu çağırır.
// Token geçerli → user bilgilerini döner
// Token süresi dolmuş/geçersiz → 401 döner → frontend logout yapar

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Token'ı header'dan veya body'den al
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.slice(7)
    : req.body?.token;

  if (!token) return res.status(401).json({ error: 'Token bulunamadı.', code: 'NO_TOKEN' });

  // İmzayı ve expiry'yi doğrula
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.', code: 'TOKEN_EXPIRED' });
  }

  try {
    // DB'den güncel kullanıcı bilgilerini çek (grup değişmiş olabilir)
    const { rows } = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.cafe_name, u.role,
             u.group_id, u.group_expires_at, u.cafe_id, u.created_at,
             g.name AS group_name, g.color AS group_color, g.permissions AS group_permissions
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = ${payload.uid}
    `;

    if (rows.length === 0) return res.status(401).json({ error: 'Kullanıcı bulunamadı.', code: 'USER_NOT_FOUND' });

    const user = rows[0];
    const licenseExpired = user.role !== 'admin' && user.group_id && user.group_expires_at
      ? new Date(user.group_expires_at) < new Date()
      : false;

    return res.status(200).json({
      success: true,
      user: { ...user, license_expired: licenseExpired },
      expires_at: payload.exp,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
