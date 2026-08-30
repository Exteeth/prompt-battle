// Vercel Serverless Function — DeepSeek API Proxy
// Frontend calls /api/evaluate → this function calls DeepSeek API directly

export default async function handler(req, res) {
  // CORS & Cache-Control headers (Direct server-to-server, no cookies, no cache)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BASE_URL = process.env.DEEPSEEK_BASE_URL || process.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
  const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  const MODEL = process.env.DEEPSEEK_MODEL || process.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';

  if (!API_KEY) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured on server. Please set DEEPSEEK_API_KEY in Vercel Environment Variables.' });
  }

  try {
    const { systemPrompt } = req.body;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const cleanBaseUrl = BASE_URL.replace(/\/+$/, '');
    const endpoint = cleanBaseUrl.endsWith('/chat/completions')
      ? cleanBaseUrl
      : (cleanBaseUrl.endsWith('/v1') ? `${cleanBaseUrl}/chat/completions` : `${cleanBaseUrl}/chat/completions`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: systemPrompt }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({ error: `DeepSeek API ${response.status}: ${errText.slice(0, 200)}` });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    
    return res.status(200).json({ content: raw });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}