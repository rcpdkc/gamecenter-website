import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { rows } = await sql`
      SELECT id, first_name, last_name, email, cafe_name, phone, role, plan, plan_expires_at, cafe_id, created_at
      FROM users
      WHERE role != 'admin'
      ORDER BY created_at DESC
    `;

    return response.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Get Users Error:', error);
    return response.status(500).json({ error: error.message });
  }
}
