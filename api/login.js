import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { username, password } = request.body;
    
    if (!username || !password) {
       return response.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }
    
    // Create admin_users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Check if any user exists, if not create default admin
    const { rowCount } = await sql`SELECT id FROM admin_users LIMIT 1`;
    if (rowCount === 0) {
      await sql`
        INSERT INTO admin_users (username, password)
        VALUES ('admin', 'admin123')
      `;
    }
    
    // Verify credentials
    const { rows } = await sql`
      SELECT id, username FROM admin_users 
      WHERE username = ${username} AND password = ${password}
    `;
    
    if (rows.length > 0) {
      // Simulate a simple token (In production, use JWT)
      const token = Buffer.from(rows[0].username + ':' + Date.now()).toString('base64');
      return response.status(200).json({ success: true, token, user: rows[0] });
    } else {
      return response.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

  } catch (error) {
    console.error("Login Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
