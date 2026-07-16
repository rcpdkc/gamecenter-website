import { sql } from '@vercel/postgres';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(request, response) {
  setCors(response);
  if (request.method === 'OPTIONS') return response.status(200).end();

  const auth = request.headers.authorization;
  const isAuthed = auth && auth.startsWith('Bearer ');

  try {
    // ── GET ───────────────────────────────────────────────────────────────
    if (request.method === 'GET') {
      const { view } = request.query;

      // ?view=cafe-link → admin hesap bağlama
      if (view === 'cafe-link') {
        if (!isAuthed) return response.status(401).json({ error: 'Yetkisiz.' });
        const users = await sql`
          SELECT id, email, cafe_name, cafe_id, hwid, role, created_at
          FROM users WHERE role = 'cafe' ORDER BY created_at DESC
        `;
        const telemetry = await sql`
          SELECT cafe_id, cafe_name, hwid, active_clients, last_updated
          FROM gamecenter_telemetry
          WHERE last_updated >= NOW() - INTERVAL '90 days'
          ORDER BY last_updated DESC
        `;
        const enriched = users.rows.map(u => ({
          ...u,
          is_linked: telemetry.rows.some(t => t.cafe_id === u.cafe_id),
          linked_telemetry: telemetry.rows.find(t => t.cafe_id === u.cafe_id) || null,
        }));
        return response.status(200).json({ success: true, users: enriched, telemetry_records: telemetry.rows });
      }

      // Normal kullanıcı listesi
      const { rows } = await sql`
        SELECT u.id, u.first_name, u.last_name, u.email, u.cafe_name, u.phone,
               u.role, u.group_id, u.group_expires_at, u.cafe_id, u.created_at, u.hwid,
               g.name AS group_name, g.color AS group_color
        FROM users u
        LEFT JOIN groups g ON u.group_id = g.id
        WHERE u.role != 'admin'
        ORDER BY u.created_at DESC
      `;
      return response.status(200).json({ success: true, data: rows });
    }

    // POST: cafe-link (admin) ve self-link (kafe otomatik)
    else if (request.method === 'POST') {
      const { action, user_email, telemetry_cafe_id, email, cafe_id: selfCafeId } = request.body;

      // self-link: kafe kendi sunucusundan otomatik baglama (token gerekmez)
      if (action === 'self-link') {
        if (!email || !selfCafeId) return response.status(400).json({ error: 'email ve cafe_id gerekli.' });
        await sql`UPDATE users SET cafe_id = ${selfCafeId} WHERE email = ${email} AND (cafe_id IS NULL OR cafe_id = '')`;
        const telRow = (await sql`SELECT hwid FROM gamecenter_telemetry WHERE cafe_id = ${selfCafeId} LIMIT 1`).rows[0];
        if (telRow && telRow.hwid) {
          await sql`UPDATE users SET hwid = ${telRow.hwid} WHERE email = ${email} AND (hwid IS NULL OR hwid = '')`;
        }
        return response.status(200).json({ success: true, message: 'cafe_id otomatik baglandi.' });
      }

      // cafe-link: admin manuel baglama (token gerekir)
      if (action === 'cafe-link') {
        if (!isAuthed) return response.status(401).json({ error: 'Yetkisiz.' });
        if (!user_email || !telemetry_cafe_id) return response.status(400).json({ error: 'user_email ve telemetry_cafe_id gerekli.' });
        const tResult = await sql`SELECT cafe_id, cafe_name, hwid FROM gamecenter_telemetry WHERE cafe_id = ${telemetry_cafe_id} LIMIT 1`;
        if (!tResult.rows[0]) return response.status(404).json({ error: 'Telemetri kaydi bulunamadi.' });
        const tel = tResult.rows[0];
        await sql`UPDATE users SET cafe_id = ${tel.cafe_id}, hwid = COALESCE(NULLIF(hwid,''),${tel.hwid||null}) WHERE email = ${user_email}`;
        return response.status(200).json({ success: true, message: user_email + ' baglandi.' });
      }

      return response.status(400).json({ error: 'Gecersiz action.' });
    }

    // ── PATCH: Kullanıcı güncelle ─────────────────────────────────────────
    else if (request.method === 'PATCH') {
      const { action, user_id } = request.body;
      if (!user_id) return response.status(400).json({ error: 'user_id zorunludur.' });

      if (action === 'update_group') {
        const { group_id, group_expires_at } = request.body;
        await sql`UPDATE users SET group_id = ${group_id || null}, group_expires_at = ${group_expires_at || null} WHERE id = ${user_id}`;
        return response.status(200).json({ success: true });
      }
      if (action === 'update_info') {
        const { first_name, last_name, cafe_name, phone } = request.body;
        await sql`UPDATE users SET first_name = ${first_name}, last_name = ${last_name}, cafe_name = ${cafe_name}, phone = ${phone} WHERE id = ${user_id}`;
        return response.status(200).json({ success: true });
      }
      return response.status(400).json({ error: 'Geçersiz action.' });
    }

    // ── DELETE: Kullanıcı sil ─────────────────────────────────────────────
    else if (request.method === 'DELETE') {
      if (!isAuthed) return response.status(401).json({ error: 'Yetkisiz.' });
      const { user_id } = request.query;
      if (!user_id) return response.status(400).json({ error: 'user_id gerekli.' });
      await sql`DELETE FROM users WHERE id = ${user_id} AND role != 'admin'`;
      return response.status(200).json({ success: true });
    }

    else {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Users API Error:', error);
    return response.status(500).json({ error: error.message });
  }
}
