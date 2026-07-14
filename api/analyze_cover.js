import { GoogleGenerativeAI } from '@google/generative-ai';
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { id, file_url } = req.body;
  if (!id || !file_url) return res.status(400).json({ error: 'id and file_url are required' });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Sunucuda GEMINI_API_KEY eksik.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Fetch the image from the URL
    const imageResp = await fetch(file_url);
    if (!imageResp.ok) {
      throw new Error("Görsel indirilemedi: " + imageResp.statusText);
    }
    
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const prompt = "Bu resim bir video oyunu kapağıdır. Lütfen SADECE VE SADECE oyunun tam, resmi ve bilinen adını söyle. Başka hiçbir açıklama yapma. Örneğin, eğer resim GTA 5 ise sadece 'Grand Theft Auto V' yaz.";

    const imageParts = [
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const gameName = response.text().trim();

    if (!gameName || gameName.length > 255) {
      throw new Error("Geçersiz oyun adı algılandı: " + gameName);
    }

    // Update database
    await sql`
      UPDATE covers 
      SET game_name = ${gameName} 
      WHERE id = ${id}
    `;

    return res.status(200).json({ success: true, game_name: gameName });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
