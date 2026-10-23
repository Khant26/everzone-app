import express from 'express';
import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

// Server-side proxy for the storefront chatbot, so the Gemini API key never
// reaches the browser. Without GEMINI_API_KEY the endpoint answers 503 and the
// storefront shows a friendly "assistant offline" reply.
const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many chat messages, please try again later.' },
});

const MAX_MESSAGE_LENGTH = 1000;

const SYSTEM_PROMPT = `You are the friendly website assistant of Ever Zone Construction and Decoration Company Limited, a construction company in Myanmar established in 2018.
Ever Zone offers building construction, architectural and structural design, interior decoration, renovation and remodeling, MEP (mechanical, electrical, plumbing) installation and steel structure fabrication for residential, commercial and industrial clients.
Answer briefly (at most about 120 words) and politely. Do not invent prices, phone numbers, addresses or project facts; for quotes, site visits or anything you are unsure about, ask the visitor to use the Contact form on this website.
Only discuss topics related to Ever Zone, construction, design and renovation.`;

router.post('/', chatLimiter, async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters`,
    });
  }
  if (!config.gemini.apiKey) {
    return res.status(503).json({ success: false, message: 'Chat assistant is not configured' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      config.gemini.model
    )}:generateContent`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.gemini.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.6 },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      console.error(`Chat upstream error: HTTP ${upstream.status}`);
      return res.status(502).json({ success: false, message: 'Chat assistant is unavailable' });
    }

    const data = await upstream.json();
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || '')
      .join('')
      .trim();

    return res.status(200).json({
      success: true,
      data: { reply: reply || "Sorry, I couldn't generate a response." },
    });
  } catch (error) {
    console.error('Chat proxy error:', error.name === 'TimeoutError' ? 'timeout' : error.message);
    return res.status(502).json({ success: false, message: 'Chat assistant is unavailable' });
  }
});

export default router;
