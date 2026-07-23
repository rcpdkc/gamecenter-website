import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// ── JWT benzeri imzalı token (HMAC-SHA256) ───────────────────────────────
const SECRET = process.env.SESSION_SECRET || 'gc-default-secret-change-in-prod-2026';
const SESSION_HOURS = 8;

function signToken(payload) {
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body    = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig     = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;
    const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (request.method === 'OPTIONS') return response.status(200).end();

  // ── POST /api/login?action=verify → Token doğrulama ────────────────────
  if (request.query?.action === 'verify' || request.body?.action === 'verify') {
    const authHeader = request.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.slice(7)
      : request.body?.token;

    if (!token) return response.status(401).json({ error: 'Token bulunamadı.', code: 'NO_TOKEN' });

    const payload = verifyToken(token);
    if (!payload) return response.status(401).json({ error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.', code: 'TOKEN_EXPIRED' });

    try {
      const { rows } = await sql`
        SELECT u.id, u.email, u.first_name, u.last_name, u.cafe_name, u.role,
               u.group_id, u.group_expires_at, u.cafe_id, u.created_at,
               g.name AS group_name, g.color AS group_color, g.permissions AS group_permissions
        FROM users u
        LEFT JOIN groups g ON u.group_id = g.id
        WHERE u.id = ${payload.uid}
      `;
      if (rows.length === 0) return response.status(401).json({ error: 'Kullanıcı bulunamadı.', code: 'USER_NOT_FOUND' });
      const user = rows[0];
      const licenseExpired = user.role !== 'admin' && user.group_id && user.group_expires_at
        ? new Date(user.group_expires_at) < new Date() : false;
      return response.status(200).json({ success: true, user: { ...user, license_expired: licenseExpired }, expires_at: payload.exp });
    } catch (err) {
      return response.status(500).json({ error: err.message });
    }
  }

  if (request.method !== 'POST') return response.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { username, password, hwid } = request.body;
    if (!username || !password) return response.status(400).json({ error: 'E-posta ve şifre zorunludur.' });

    // Ensure groups table
    await sql`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(30) DEFAULT '#f97316',
        permissions JSON DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure reference_codes table
    await sql`
      CREATE TABLE IF NOT EXISTS reference_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        cafe_name VARCHAR(255),
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'cafe',
        group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
        group_expires_at TIMESTAMP,
        cafe_id VARCHAR(100),
        hwid VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Migrations
    const migrations = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS group_id INTEGER`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS group_expires_at TIMESTAMP`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS cafe_id VARCHAR(100)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS hwid VARCHAR(255)`,
      `ALTER TABLE groups ADD COLUMN IF NOT EXISTS permissions JSON DEFAULT '[]'`,
    ];
    for (const m of migrations) {
      try { await sql.query(m); } catch (_) {}
    }

    // ── Seed/Migrate admin şifresi ───────────────────────────────────────
    // Bcrypt hash ile güvenli admin hesabı — plain text şifre artık yok
    // GÜVENLİK: Koda gömülü şifre kaldırıldı. Vercel ortam değişkeninden okunur.
    // ADMIN_DEFAULT_PASSWORD tanımlı değilse rastgele bir şifre üretilir (kimse
    // varsayılan şifreyle giremez); admin, şifre sıfırlama akışıyla erişir.
    const DEFAULT_ADMIN_PW = process.env.ADMIN_DEFAULT_PASSWORD || crypto.randomBytes(24).toString('hex');
    const { rows: adminRows } = await sql`SELECT id, password FROM users WHERE role = 'admin' LIMIT 1`;
    if (adminRows.length === 0) {
      // İlk kez: hashed şifreyle oluştur
      const hashed = await bcrypt.hash(DEFAULT_ADMIN_PW, 12);
      await sql`INSERT INTO users (first_name, last_name, email, password, role, cafe_id)
        VALUES ('Super', 'Admin', 'admin', ${hashed}, 'admin', ${crypto.randomUUID()})`;
    } else if (!adminRows[0].password.startsWith('$2')) {
      // Eski plain text şifre varsa → hashed versiyona geç
      const hashed = await bcrypt.hash(DEFAULT_ADMIN_PW, 12);
      await sql`UPDATE users SET password = ${hashed} WHERE role = 'admin'`;
    }

    // ── Kullanıcıyı e-posta ile bul ─────────────────────────────────────
    const { rows } = await sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.cafe_name, u.role,
             u.group_id, u.group_expires_at, u.cafe_id, u.hwid, u.created_at,
             u.password AS pw_hash,
             g.name AS group_name, g.color AS group_color, g.permissions AS group_permissions
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.email = ${username}
    `;

    if (rows.length === 0) return response.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });

    const user = rows[0];

    // ── Şifre doğrulama (bcrypt) ─────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.pw_hash);
    if (!passwordMatch) return response.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });

    // pw_hash'i response'dan çıkar
    const { pw_hash, ...safeUser } = user;

    // HWID Binding
    if (safeUser.role !== 'admin' && hwid) {
      if (!safeUser.hwid) {
        await sql`UPDATE users SET hwid = ${hwid} WHERE id = ${safeUser.id}`;
        safeUser.hwid = hwid;
      } else if (safeUser.hwid !== hwid) {
        return response.status(403).json({ error: 'Bu hesap başka bir sunucuya kayıtlıdır. Lütfen yönetici ile iletişime geçin.' });
      }
    }

    const licenseExpired = safeUser.role !== 'admin' && safeUser.group_id && safeUser.group_expires_at
      ? new Date(safeUser.group_expires_at) < new Date()
      : false;

    const now = Date.now();
    const exp = now + SESSION_HOURS * 60 * 60 * 1000;
    const token = signToken({ uid: safeUser.id, email: safeUser.email, role: safeUser.role, iat: now, exp });

    return response.status(200).json({
      success: true,
      token,
      expires_at: exp,
      user: { ...safeUser, license_expired: licenseExpired }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return response.status(500).json({ error: error.message });
  }
}
