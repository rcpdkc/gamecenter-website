import { Resend } from 'resend';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-posta adresi gerekli.' });

  try {
    // 1. Kullanıcıyı bul
    const result = await sql`SELECT id, email FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
    
    // Güvenlik: kullanıcı yoksa da aynı mesajı ver (e-posta enumeration önlemi)
    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });
    }

    const user = result.rows[0];

    // 2. Token oluştur (64 char hex, 1 saat geçerli)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    // 3. Eski tokenları temizle + yenisini kaydet
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token      VARCHAR(64) PRIMARY KEY,
        email      VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP   NOT NULL,
        created_at TIMESTAMP   DEFAULT NOW()
      )
    `;
    await sql`DELETE FROM password_reset_tokens WHERE email = ${user.email}`;
    await sql`INSERT INTO password_reset_tokens (token, email, expires_at) VALUES (${token}, ${user.email}, ${expiresAt})`;

    // 4. Sıfırlama linki
    const resetLink = `https://gamecenter.rcpdkc.com/reset-password?token=${token}`;

    // 5. Mail gönder
    await resend.emails.send({
      from: 'Game Center <noreply@rcpdkc.com>',
      to: user.email,
      subject: 'Şifre Sıfırlama Talebi — Game Center Cloud',
      html: `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifre Sıfırlama</title>
</head>
<body style="margin:0;padding:0;background:#050608;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050608;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0f18;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;max-width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 20px;margin-bottom:16px;">
                <span style="font-size:28px;">🎮</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Game Center Cloud</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Şifre Sıfırlama Talebi</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hesabınız için bir şifre sıfırlama talebinde bulunuldu.<br>
                Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
              </p>

              <!-- Button -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}"
                   style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;box-shadow:0 4px 20px rgba(249,115,22,0.35);">
                  Şifremi Sıfırla →
                </a>
              </div>

              <!-- Warning -->
              <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:10px;padding:16px;margin:24px 0;">
                <p style="margin:0;color:#fb923c;font-size:13px;line-height:1.6;">
                  ⏱️ Bu bağlantı <strong>1 saat</strong> içinde geçerliliğini yitirecektir.<br>
                  🔒 Tek kullanımlıktır, sıfırlama sonrası geçersiz olur.
                </p>
              </div>

              <!-- Link fallback -->
              <p style="color:#4b5563;font-size:12px;margin:24px 0 0;word-break:break-all;">
                Buton çalışmıyorsa bu bağlantıyı tarayıcınıza yapıştırın:<br>
                <span style="color:#6b7280;">${resetLink}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;color:#374151;font-size:12px;text-align:center;">
                © 2026 Game Center Cloud — rcpdkc.com<br>
                Bu e-postayı beklemediyseniz güvenle silebilirsiniz.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return res.status(200).json({ success: true, message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });

  } catch (error) {
    console.error('[forgot-password]', error);
    return res.status(500).json({ error: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
  }
}
