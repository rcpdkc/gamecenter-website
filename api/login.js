import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { username, password } = request.body;
    
    if (!username || !password) {
       return response.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
    }
    
    // Create users table with full schema if not exists
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
        plan VARCHAR(50) DEFAULT 'free',
        plan_expires_at TIMESTAMP,
        cafe_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add missing columns if table exists from before (migration)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free'`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS cafe_id VARCHAR(100)`;
    } catch (_) {}
    
    // Seed default admin if none exists
    const { rowCount } = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    if (rowCount === 0) {
      const adminCafeId = crypto.randomUUID();
      await sql`
        INSERT INTO users (first_name, last_name, email, password, role, plan, cafe_id)
        VALUES ('Super', 'Admin', 'admin', 'admin123', 'admin', 'enterprise', ${adminCafeId})
      `;
    }
    
    // Verify credentials
    const { rows } = await sql`
      SELECT id, email, first_name, last_name, cafe_name, role, plan, plan_expires_at, cafe_id
      FROM users 
      WHERE email = ${username} AND password = ${password}
    `;
    
    if (rows.length === 0) {
      return response.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
    }

    const user = rows[0];

    // Check license expiry (non-admin, non-free)
    let licenseExpired = false;
    if (user.role !== 'admin' && user.plan !== 'free' && user.plan_expires_at) {
      if (new Date(user.plan_expires_at) < new Date()) {
        licenseExpired = true;
      }
    }

    const token = Buffer.from(user.email + ':' + Date.now()).toString('base64');
    
    return response.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        cafe_name: user.cafe_name,
        role: user.role,
        plan: user.plan,
        plan_expires_at: user.plan_expires_at,
        cafe_id: user.cafe_id,
        license_expired: licenseExpired
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
