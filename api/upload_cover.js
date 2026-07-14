import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'multipart/form-data gereklidir.' });
    }

    // Parse multipart manually via stream
    const { IncomingForm } = await import('formidable');
    const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 }); // 10MB

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const game_name = Array.isArray(fields.game_name) ? fields.game_name[0] : fields.game_name;
    const uploaded_by_id = Array.isArray(fields.uploaded_by_id) ? fields.uploaded_by_id[0] : fields.uploaded_by_id;
    const uploaded_by_role = Array.isArray(fields.uploaded_by_role) ? fields.uploaded_by_role[0] : fields.uploaded_by_role;
    const cafe_id = Array.isArray(fields.cafe_id) ? fields.cafe_id[0] : fields.cafe_id;

    if (!game_name) return res.status(400).json({ error: 'Oyun adı zorunludur.' });

    const file = files.file;
    const fileObj = Array.isArray(file) ? file[0] : file;
    if (!fileObj) return res.status(400).json({ error: 'Dosya seçilmedi.' });

    const { originalFilename, mimetype, filepath } = fileObj;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimetype)) {
      return res.status(400).json({ error: 'Sadece JPEG, PNG veya WebP formatları desteklenir.' });
    }

    const ext = originalFilename.split('.').pop();
    const blobName = `covers/${Date.now()}_${game_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;

    const blob = await put(blobName, fs.createReadStream(filepath), {
      access: 'public',
      contentType: mimetype
    });

    // Ensure covers table exists
    await sql`
      CREATE TABLE IF NOT EXISTS covers (
        id SERIAL PRIMARY KEY,
        game_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        uploaded_by_id INTEGER,
        uploaded_by_role VARCHAR(50),
        cafe_id VARCHAR(100),
        status VARCHAR(30) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Admin covers are auto-approved
    const status = uploaded_by_role === 'admin' ? 'approved' : 'pending';

    const { rows } = await sql`
      INSERT INTO covers (game_name, file_url, uploaded_by_id, uploaded_by_role, cafe_id, status)
      VALUES (${game_name}, ${blob.url}, ${uploaded_by_id || null}, ${uploaded_by_role || 'cafe'}, ${cafe_id || null}, ${status})
      RETURNING *
    `;

    return res.status(200).json({ success: true, cover: rows[0] });
  } catch (error) {
    console.error('Upload Cover Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
