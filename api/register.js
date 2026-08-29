import { sql } from './_db.js';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
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
    // 0. Kolon göçü (References sayfası hiç açılmadıysa da çalışsın — idempotent)
    try { await sql`ALTER TABLE reference_codes ALTER COLUMN email DROP NOT NULL`; } catch {}
    try { await sql`ALTER TABLE reference_codes ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 1`; } catch {}
    try { await sql`ALTER TABLE reference_codes ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0`; } catch {}
    try { await sql`UPDATE reference_codes SET used_count = max_uses WHERE is_used = true AND used_count = 0`; } catch {}

    // 1. Referans kodunu doğrula — çok-kullanımlı: kullanım hakkı bitmemiş olmalı
    const { rows: codes } = await sql`
      SELECT * FROM reference_codes
      WHERE code = ${referenceCode}
      AND used_count < max_uses
    `;

    if (codes.length === 0) {
      return res.status(400).json({ error: 'Geçersiz veya kullanım hakkı dolmuş referans kodu.' });
    }
    const rc = codes[0];
    // Kod bir e-postaya kilitliyse yalnız o e-posta kullanabilir; boş (herkese açık) ise serbest
    if (rc.email && rc.email.trim().toLowerCase() !== String(email).trim().toLowerCase()) {
      return res.status(400).json({ error: 'Bu referans kodu farklı bir e-posta adresine tanımlıdır.' });
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
    // GÜVENLİK: Şifre bcrypt ile hash'lenir. login.js zaten bcrypt.compare
    // beklediğinden, düz metin saklamak hem güvensiz hem de girişi bozuyordu.
    const cafeId = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 12);
    const { rows: newUsers } = await sql`
      INSERT INTO users (first_name, last_name, cafe_name, phone, email, password, group_id, cafe_id)
      VALUES (${firstName}, ${lastName}, ${cafeName}, ${phone}, ${email}, ${hashedPassword}, NULL, ${cafeId})
      RETURNING id, email, first_name, last_name, cafe_name, cafe_id
    `;

    // 5. Kullanım sayacını artır — hak dolunca is_used=true (geriye uyumlu)
    await sql`
      UPDATE reference_codes
      SET used_count = used_count + 1,
          is_used = (used_count + 1 >= max_uses)
      WHERE id = ${rc.id}
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
