import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
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
    else if (request.method === 'PATCH' || request.method === 'POST') {
      const { action, user_id } = request.body;
      if (!user_id) return response.status(400).json({ error: 'user_id zorunludur.' });
      
      if (action === 'update_group') {
        const { group_id, group_expires_at } = request.body;
        const expiresAt = group_id && group_expires_at ? group_expires_at : null;
        const gid = group_id || null;
        await sql`UPDATE users SET group_id = ${gid}, group_expires_at = ${expiresAt} WHERE id = ${user_id}`;
        return response.status(200).json({ success: true });
      }
      else if (action === 'assign_cafe_id') {
        const { cafe_id } = request.body;
        if (!cafe_id) return response.status(400).json({ error: 'cafe_id zorunludur.' });
        await sql`UPDATE users SET cafe_id = ${cafe_id} WHERE id = ${user_id}`;
        return response.status(200).json({ success: true });
      }
      else if (action === 'update_hwid') {
        const { hwid } = request.body;
        await sql`UPDATE users SET hwid = ${hwid || null} WHERE id = ${user_id}`;
        return response.status(200).json({ success: true });
      }
      else if (action === 'update_plan') {
        const { plan, plan_expires_at } = request.body;
        if (!plan) return response.status(400).json({ error: 'plan zorunludur.' });
        const expiresAt = plan === 'free' ? null : (plan_expires_at || null);
        await sql`UPDATE users SET plan = ${plan}, plan_expires_at = ${expiresAt} WHERE id = ${user_id}`;
        return response.status(200).json({ success: true, message: 'Plan başarıyla güncellendi.' });
      }
      else {
         return response.status(400).json({ error: 'Geçersiz action parametresi.' });
      }
    }
    else {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error("Users API Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
