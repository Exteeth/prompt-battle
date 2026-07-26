// Vercel Serverless Function — KKU API Proxy
// Frontend calls /api/evaluate → this function calls KKU API
// This avoids browser CORS/network blocking issues

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const KKU_BASE_URL = process.env.VITE_KKU_BASE_URL || 'https://gen.ai.kku.ac.th/api/v1';
  const KKU_API_KEY = process.env.VITE_KKU_API_KEY;
  const KKU_MODEL = process.env.VITE_KKU_MODEL || 'deepseek-v4-flash';

  if (!KKU_API_KEY) {
    return res.status(500).json({ error: 'KKU_API_KEY not configured on server' });
  }

  try {
    const { systemPrompt } = req.body;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${KKU_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KKU_API_KEY}`
      },
      body: JSON.stringify({
        model: KKU_MODEL,
        messages: [{ role: 'user', content: systemPrompt }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({ error: `KKU API ${response.status}: ${errText.slice(0, 200)}` });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    
    return res.status(200).json({ content: raw });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}