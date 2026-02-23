// api/send-to-bot.js   (use this exact path for static Vercel projects)

export default async function handler(req, res) {
  // Only allow POST requests from your Mini App
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed – Use POST' });
  }

  const { data, userId } = req.body || {};

  if (!data) {
    return res.status(400).json({ error: 'Missing data in request body' });
  }

  // Load secrets from Vercel Environment Variables
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const YOUR_CHAT_ID = process.env.YOUR_CHAT_ID;  // your personal Telegram user ID (number)

  if (!BOT_TOKEN || !YOUR_CHAT_ID) {
    console.error('Missing BOT_TOKEN or YOUR_CHAT_ID in env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Build the message you want to receive in your Telegram
  const messageText = `Mini App data received:\n\`\`\`\n${JSON.stringify(data, null, 2)}\n\`\`\`\nFrom user: ${userId || 'unknown'}\nTime: ${new Date().toISOString()}`;

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: YOUR_CHAT_ID,
          text: messageText,
          parse_mode: 'MarkdownV2',  // Better for code blocks
        }),
      }
    );

    const result = await telegramResponse.json();

    if (!result.ok) {
      throw new Error(result.description || 'Telegram sendMessage failed');
    }

    return res.status(200).json({
      success: true,
      message: 'Data forwarded to your Telegram',
    });
  } catch (error) {
    console.error('Error forwarding to Telegram:', error);
    return res.status(500).json({ error: 'Failed to forward message' });
  }
}