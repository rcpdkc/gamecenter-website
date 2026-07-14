import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { first_name, last_name, email, cafe_name, phone, password, reference_code } = request.body;
    
    if (!first_name || !last_name || !email || !cafe_name || !phone || !password || !reference_code) {
       return response.status(400).json({ error: 'Lütfen tüm alanları doldurun.' });
    }
    
    // 1. Verify Reference Code
    const { rows: refRows } = await sql`
      SELECT id, is_used FROM reference_codes 
      WHERE email = ${email} AND code = ${reference_code}
    `;
    
    if (refRows.length === 0) {
      return response.status(400).json({ error: 'Geçersiz referans kodu veya eşleşmeyen e-posta adresi.' });
    }
    
    if (refRows[0].is_used) {
      return response.status(400).json({ error: 'Bu referans kodu daha önce kullanılmış.' });
    }
    
    // 2. Check if email already registered
    const { rows: userRows } = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (userRows.length > 0) {
      return response.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    // 3. Register User
    await sql`
      INSERT INTO users (first_name, last_name, email, cafe_name, phone, password, role)
      VALUES (${first_name}, ${last_name}, ${email}, ${cafe_name}, ${phone}, ${password}, 'cafe')
    `;
    
    // 4. Mark Reference Code as used
    await sql`
      UPDATE reference_codes SET is_used = TRUE WHERE id = ${refRows[0].id}
    `;
    
    return response.status(200).json({ success: true, message: 'Kayıt başarıyla tamamlandı. Artık giriş yapabilirsiniz.' });

  } catch (error) {
    console.error("Register Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
