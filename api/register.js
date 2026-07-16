import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support both camelCase (web_admin) and snake_case (website) payloads
  const firstName = req.body.firstName || req.body.first_name;
  const lastName = req.body.lastName || req.body.last_name;
  const cafeName = req.body.cafeName || req.body.cafe_name;
  const phone = req.body.phone;
  const email = req.body.email;
  const password = req.body.password;
  const referenceCode = req.body.referenceCode || req.body.reference_code;

  if (!firstName || !lastName || !cafeName || !phone || !email || !password || !referenceCode) {
    return res.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
  }

  try {
    // 1. Verify Reference Code
    const { rows: codes } = await sql`
      SELECT * FROM reference_codes 
      WHERE code = ${referenceCode} 
      AND email = ${email} 
      AND is_used = false
    `;

    if (codes.length === 0) {
      return res.status(400).json({ error: 'Geçersiz, kullanılmış veya e-postanızla eşleşmeyen referans kodu.' });
    }

    // 2. Check if user email already exists
    const { rows: existingUsers } = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    // 3. Find the free group (assume Free/Normal is id=1, or find by name if needed. Let's just set group_id=null or create a default group)
    // Actually, usually they get assigned a default group or null, and admin can change it later.
    // Let's set group_id to NULL initially.
    
    // 4. Create User (cafe_id otomatik UUID ile atanır)
    const cafeId = randomUUID();
    const { rows: newUsers } = await sql`
      INSERT INTO users (first_name, last_name, cafe_name, phone, email, password, group_id, cafe_id)
      VALUES (${firstName}, ${lastName}, ${cafeName}, ${phone}, ${email}, ${password}, NULL, ${cafeId})
      RETURNING id, email, first_name, last_name, cafe_name, cafe_id
    `;

    // 5. Mark Reference Code as Used
    await sql`
      UPDATE reference_codes SET is_used = true WHERE id = ${codes[0].id}
    `;

    return res.status(200).json({ 
      success: true, 
      message: 'Kayıt başarıyla tamamlandı. Artık giriş yapabilirsiniz.',
      user: newUsers[0],
      cafe_id: newUsers[0].cafe_id
    });

  } catch (error) {
    console.error('Register API Error:', error);
    return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
}
