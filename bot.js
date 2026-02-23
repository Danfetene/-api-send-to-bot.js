// api/notify-me.js

export default async function handler(req, res) {
  // Handle CORS (important for Telegram WebView)
  res.setHeader('Access-Control-Allow-Origin', '*');           // or tighten later
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { choice, timestamp, user } = body;

  if (!choice) {
    return res.status(400).json({ error: 'Missing choice' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.YOUR_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing BOT_TOKEN or YOUR_CHAT_ID');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const text = 
`Mini App choice received:
• Choice: **${choice}**
• Time: ${timestamp || new Date().toISOString()}
• User: ${user?.first_name || 'Unknown'} (${user?.id || '?'})`;

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      }
    );

    const result = await telegramRes.json();

    if (!result.ok) {
      throw new Error(result.description || 'Telegram error');
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}