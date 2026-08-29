import { sql } from './_db.js';

export default async function handler(request, response) {
  try {
    // Tablo + göç: e-posta artık OPSİYONEL, kodlar çok-kullanımlı olabilir
    await sql`
      CREATE TABLE IF NOT EXISTS reference_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        code VARCHAR(50) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        max_uses INT DEFAULT 1,
        used_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    // Var olan tabloya kolon/kısıt göçü (idempotent)
    try { await sql`ALTER TABLE reference_codes ALTER COLUMN email DROP NOT NULL`; } catch {}
    try { await sql`ALTER TABLE reference_codes ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 1`; } catch {}
    try { await sql`ALTER TABLE reference_codes ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0`; } catch {}
    // Eski kullanılmış kodları koru: is_used=true ise hakkı dolmuş say (yeniden açılmasın)
    try { await sql`UPDATE reference_codes SET used_count = max_uses WHERE is_used = true AND used_count = 0`; } catch {}

    if (request.method === 'GET') {
      const { rows } = await sql`
        SELECT id, email, code, is_used, max_uses, used_count, created_at FROM reference_codes
        ORDER BY created_at DESC
      `;
      return response.status(200).json({ success: true, data: rows });
    }

    else if (request.method === 'POST') {
      const { email, max_uses } = request.body;
      // E-posta opsiyonel: boş → herkese açık kod. Kullanım hakkı 1..9999.
      const mail = (email && String(email).trim()) ? String(email).trim() : null;
      const uses = Math.min(9999, Math.max(1, parseInt(max_uses, 10) || 1));

      const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
      const code = `GC-${randomString}`;

      await sql`INSERT INTO reference_codes (email, code, max_uses, used_count) VALUES (${mail}, ${code}, ${uses}, 0)`;
      return response.status(200).json({ success: true, code, email: mail, max_uses: uses });
    }
    
    else if (request.method === 'DELETE') {
      const { id } = request.body;
      if (!id) return response.status(400).json({ error: 'ID is required' });
      await sql`DELETE FROM reference_codes WHERE id = ${id}`;
      return response.status(200).json({ success: true });
    }
    
    else {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("References API Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
