import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { username, password } = request.body;
    
    if (!username || !password) {
       return response.status(400).json({ error: 'Kullanıcı adı/Email ve şifre zorunludur.' });
    }
    
    // Create users table if it doesn't exist
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Check if any admin exists, if not create default admin (username acts as email for login here)
    const { rowCount } = await sql`SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    if (rowCount === 0) {
      await sql`
        INSERT INTO users (first_name, last_name, email, password, role)
        VALUES ('Super', 'Admin', 'admin', 'admin123', 'admin')
      `;
    }
    
    // Verify credentials (allow login by email/username)
    const { rows } = await sql`
      SELECT id, email, first_name, last_name, cafe_name, role FROM users 
      WHERE email = ${username} AND password = ${password}
    `;
    
    if (rows.length > 0) {
      // Simulate a simple token (In production, use JWT)
      const token = Buffer.from(rows[0].email + ':' + Date.now()).toString('base64');
      return response.status(200).json({ success: true, token, user: rows[0] });
    } else {
      return response.status(401).json({ error: 'Geçersiz e-posta/kullanıcı adı veya şifre.' });
    }

  } catch (error) {
    console.error("Login Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
