import { sql } from '@vercel/postgres';

// Genel arsiv endpoint'i: ?type=shader -> shader_archive tablosu, aksi halde mklink_archive.
// (Vercel Hobby 12-fonksiyon limiti nedeniyle ayri fonksiyon yerine tek endpoint kullanilir.)
export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  const isShader = (request.query && request.query.type === 'shader');

  try {
    if (isShader) {
      // ── Shader cache DIZIN arsivi (oyun adina gore; cache dosyalari degil) ──
      await sql`
        CREATE TABLE IF NOT EXISTS shader_archive (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          data_json JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      if (request.method === 'GET') {
        const { rows } = await sql`
          SELECT id, name, description, data_json, created_at FROM shader_archive
          ORDER BY created_at DESC
        `;
        return response.status(200).json({ success: true, data: rows });
      }
      else if (request.method === 'POST') {
        const { name, description, data_json } = request.body;
        if (!name || !data_json) return response.status(400).json({ error: 'Isim ve veri zorunludur.' });
        // Ayni oyun adi varsa guncelle (upsert)
        await sql`DELETE FROM shader_archive WHERE LOWER(name) = LOWER(${name})`;
        await sql`
          INSERT INTO shader_archive (name, description, data_json)
          VALUES (${name}, ${description || null}, ${data_json})
        `;
        return response.status(200).json({ success: true, message: 'Shader dizinleri arsive eklendi.' });
      }
      else if (request.method === 'DELETE') {
        const { id } = request.body;
        if (!id) return response.status(400).json({ error: 'ID zorunludur.' });
        await sql`DELETE FROM shader_archive WHERE id = ${id}`;
        return response.status(200).json({ success: true, message: 'Kayit arsivden silindi.' });
      }
      return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // ── MkLink sablon arsivi (varsayilan) ──
    await sql`
      CREATE TABLE IF NOT EXISTS mklink_archive (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        data_json JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    if (request.method === 'GET') {
      const { rows } = await sql`
        SELECT id, name, description, data_json, created_at FROM mklink_archive
        ORDER BY created_at DESC
      `;
      return response.status(200).json({ success: true, data: rows });
    }
    else if (request.method === 'POST') {
      const { name, description, data_json } = request.body;
      if (!name || !data_json) return response.status(400).json({ error: 'İsim ve veri zorunludur.' });
      await sql`
        INSERT INTO mklink_archive (name, description, data_json)
        VALUES (${name}, ${description || null}, ${data_json})
      `;
      return response.status(200).json({ success: true, message: 'Şablon başarıyla arşive eklendi.' });
    }
    else if (request.method === 'DELETE') {
      const { id } = request.body;
      if (!id) return response.status(400).json({ error: 'ID zorunludur.' });
      await sql`DELETE FROM mklink_archive WHERE id = ${id}`;
      return response.status(200).json({ success: true, message: 'Şablon arşivden silindi.' });
    }
    else {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("Archive API Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
