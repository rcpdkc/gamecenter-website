import { Resend } from 'resend';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY);

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ─── Log yardımcısı ──────────────────────────────────────────────────────────
async function writeLog(event, email, details = '', ip = '') {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id         SERIAL PRIMARY KEY,
        event      VARCHAR(100) NOT NULL,
        email      VARCHAR(255),
        details    TEXT,
        ip         VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      INSERT INTO system_logs (event, email, details, ip)
      VALUES (${event}, ${email}, ${details}, ${ip})
    `;
  } catch (e) {
    console.error('[log write error]', e.message);
  }
}

// ─── Tablo garantisi ─────────────────────────────────────────────────────────
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token      VARCHAR(64) PRIMARY KEY,
      email      VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP   NOT NULL,
      created_at TIMESTAMP   DEFAULT NOW()
    )
  `;
}

// ─── POST /api/auth?action=forgot ────────────────────────────────────────────
async function handleForgot(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-posta adresi gerekli.' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

  try {
    await ensureTable();

    const result = await sql`SELECT id, email FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;

    // Güvenlik: kullanıcı yoksa da aynı mesajı ver (enumeration önlemi)
    if (result.rows.length === 0) {
      await writeLog('PASSWORD_RESET_REQUEST_UNKNOWN', email, 'Bilinmeyen e-posta ile istek', ip);
      return res.status(200).json({ success: true, message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql`DELETE FROM password_reset_tokens WHERE email = ${user.email}`;
    await sql`INSERT INTO password_reset_tokens (token, email, expires_at) VALUES (${token}, ${user.email}, ${expiresAt})`;

    const resetLink = `https://gamecenter.rcpdkc.com/reset-password?token=${token}`;

    // Mail gönder
    let mailError = null;
    try {
      const mailResult = await resend.emails.send({
        from: 'Game Center <noreply@rcpdkc.com>',
        to: user.email,
        subject: 'Şifre Sıfırlama Talebi — Game Center Cloud',
        html: `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><title>Şifre Sıfırlama</title></head>
<body style="margin:0;padding:0;background:#050608;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050608;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0f18;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;max-width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 20px;margin-bottom:16px;"><span style="font-size:28px;">🎮</span></div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Game Center Cloud</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">Şifre Sıfırlama Talebi</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 24px;">Hesabınız için bir şifre sıfırlama talebinde bulunuldu.<br>Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;">Şifremi Sıfırla →</a>
            </div>
            <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:10px;padding:16px;">
              <p style="margin:0;color:#fb923c;font-size:13px;line-height:1.6;">⏱️ <strong>1 saat</strong> içinde geçerliliğini yitirir.<br>🔒 Tek kullanımlıktır.</p>
            </div>
            <p style="color:#4b5563;font-size:12px;margin:20px 0 0;word-break:break-all;">Buton çalışmıyorsa: <span style="color:#6b7280;">${resetLink}</span></p>
          </td>
        </tr>
        <tr><td style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;"><p style="margin:0;color:#374151;font-size:12px;">© 2026 Game Center Cloud — rcpdkc.com</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      if (mailResult?.error) {
        mailError = mailResult.error;
      }
    } catch (e) {
      mailError = e.message;
    }

    if (mailError) {
      console.error('[auth/forgot] mail error:', mailError);
      await writeLog('PASSWORD_RESET_MAIL_FAILED', user.email, String(mailError), ip);
      // Mail gönderimi başarısız olsa da kullanıcıya aynı mesaj ver
      // (güvenlik) ama 500 dönme
      return res.status(200).json({
        success: true,
        message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.',
        _debug: process.env.NODE_ENV !== 'production' ? String(mailError) : undefined,
      });
    }

    await writeLog('PASSWORD_RESET_REQUEST', user.email, 'Sıfırlama maili gönderildi', ip);
    return res.status(200).json({ success: true, message: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.' });

  } catch (error) {
    console.error('[auth/forgot]', error);
    await writeLog('PASSWORD_RESET_ERROR', email, error.message, ip).catch(() => {});
    return res.status(500).json({ error: 'Bir hata oluştu.', detail: error.message });
  }
}

// ─── POST /api/auth?action=reset ─────────────────────────────────────────────
async function handleReset(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token ve şifre gerekli.' });
  if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

  try {
    await ensureTable();

    const result = await sql`
      SELECT * FROM password_reset_tokens
      WHERE token = ${token} AND expires_at > NOW()
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      await writeLog('PASSWORD_RESET_INVALID_TOKEN', '', 'Geçersiz veya süresi dolmuş token', ip);
      return res.status(400).json({ error: 'Bu bağlantı geçersiz veya süresi dolmuş.' });
    }

    const { email } = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 12);

    await sql`UPDATE users SET password = ${hashedPassword} WHERE email = ${email}`;
    await sql`DELETE FROM password_reset_tokens WHERE token = ${token}`;

    await writeLog('PASSWORD_RESET_SUCCESS', email, 'Şifre başarıyla sıfırlandı', ip);
    return res.status(200).json({ success: true, message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });

  } catch (error) {
    console.error('[auth/reset]', error);
    return res.status(500).json({ error: 'Bir hata oluştu.', detail: error.message });
  }
}

// ─── Ana handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const action = req.query.action;
  if (action === 'forgot') return handleForgot(req, res);
  if (action === 'reset')  return handleReset(req, res);

  return res.status(400).json({ error: 'Geçersiz action. Kullanım: ?action=forgot veya ?action=reset' });
}
