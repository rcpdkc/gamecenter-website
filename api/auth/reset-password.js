import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ error: 'Token ve şifre gerekli.' });
  if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });

  try {
    // 1. Token doğrula
    const result = await sql`
      SELECT * FROM password_reset_tokens
      WHERE token = ${token}
        AND expires_at > NOW()
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Bu bağlantı geçersiz veya süresi dolmuş. Yeni bir sıfırlama talebi oluşturun.' });
    }

    const { email } = result.rows[0];

    // 2. Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Kullanıcının şifresini güncelle
    await sql`UPDATE users SET password = ${hashedPassword} WHERE email = ${email}`;

    // 4. Token'ı sil (tek kullanımlık)
    await sql`DELETE FROM password_reset_tokens WHERE token = ${token}`;

    return res.status(200).json({ success: true, message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });

  } catch (error) {
    console.error('[reset-password]', error);
    return res.status(500).json({ error: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
}
