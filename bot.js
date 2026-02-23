// api/send-to-bot.js  (Vercel serverless function - Pages Router style)

export default async function handler(req, res) {
  // Allow CORS from Telegram WebView origins
  const allowedOrigins = [
    'https://web.telegram.org',
    'https://webk.telegram.org',   // web K version
    'https://web.telegram.org/k/'  // sometimes seen
  ];

  const origin = req.headers.origin;

  // Set CORS headers for all responses (including errors & OPTIONS)
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes(origin) ? origin : '*'); // or strict: origin if matched
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request (browser sends this before POST)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST after preflight
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – Use POST' });
  }

  const { choice, timestamp, user } = req.body || {};

  if (!choice) {
    return res.status(400).json({ error: 'Missing choice in request body' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const YOUR_CHAT_ID = process.env.YOUR_CHAT_ID;

  if (!BOT_TOKEN || !YOUR_CHAT_ID) {
    console.error('Missing env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const messageText = `Mini App choice:\n\`\`\`\nChoice: ${choice}\nTime: ${timestamp}\nUser: ${user?.first_name || 'Unknown'} (ID: ${user?.id || 'unknown'})\n\`\`\``;

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: YOUR_CHAT_ID,
          text: messageText,
          parse_mode: 'MarkdownV2',
        }),
      }
    );

    const result = await telegramResponse.json();

    if (!result.ok) {
      throw new Error(result.description || 'Telegram API error');
    }

    return res.status(200).json({ success: true, message: 'Sent to your Telegram' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to forward message' });
  }
}