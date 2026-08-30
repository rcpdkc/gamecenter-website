import { sql } from './_db.js';

// PERF: tablo+göç HER istekte değil, warm instance başına BİR kez çalışır (Supabase gecikmesi azalır).
let _refReady = false;
async function ensureRef() {
  if (_refReady) return;
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
  try { await sql`ALTER TABLE reference_codes ALTER COLUMN email DROP NOT NULL`; } catch {}
  try { await sql`ALTER TABLE reference_codes ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 1`; } catch {}
  try { await sql`ALTER TABLE reference_codes ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0`; } catch {}
  try { await sql`ALTER TABLE reference_codes ADD COLUMN IF NOT EXISTS group_id INTEGER`; } catch {}
  try { await sql`UPDATE reference_codes SET used_count = max_uses WHERE is_used = true AND used_count = 0`; } catch {}
  _refReady = true;
}

export default async function handler(request, response) {
  try {
    await ensureRef();

    if (request.method === 'GET') {
      const { rows } = await sql`
        SELECT r.id, r.email, r.code, r.is_used, r.max_uses, r.used_count, r.group_id,
               g.name AS group_name, g.color AS group_color, r.created_at
        FROM reference_codes r
        LEFT JOIN groups g ON g.id = r.group_id
        ORDER BY r.created_at DESC
      `;
      return response.status(200).json({ success: true, data: rows });
    }

    else if (request.method === 'POST') {
      const { email, max_uses, group_id } = request.body;
      // E-posta opsiyonel: boş → herkese açık kod. Kullanım hakkı 1..9999.
      const mail = (email && String(email).trim()) ? String(email).trim() : null;
      const uses = Math.min(9999, Math.max(1, parseInt(max_uses, 10) || 1));
      const gid = (group_id === 0 || group_id) ? (parseInt(group_id, 10) || null) : null;

      const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
      const code = `GC-${randomString}`;

      await sql`INSERT INTO reference_codes (email, code, max_uses, used_count, group_id) VALUES (${mail}, ${code}, ${uses}, 0, ${gid})`;
      return response.status(200).json({ success: true, code, email: mail, max_uses: uses, group_id: gid });
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
