import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user_id, plan, plan_expires_at } = request.body;

    if (!user_id || !plan) {
      return response.status(400).json({ error: 'user_id ve plan zorunludur.' });
    }

    // For 'free' plan, clear expiry date
    const expiresAt = plan === 'free' ? null : (plan_expires_at || null);

    await sql`
      UPDATE users
      SET plan = ${plan}, plan_expires_at = ${expiresAt}
      WHERE id = ${user_id}
    `;

    return response.status(200).json({ success: true, message: 'Plan başarıyla güncellendi.' });
  } catch (error) {
    console.error('Update Plan Error:', error);
    return response.status(500).json({ error: error.message });
  }
}
