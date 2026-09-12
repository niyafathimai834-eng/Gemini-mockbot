import "dotenv/config";
import express from "express";
import cors from "cors";
import { mockResponse } from "./mockbrain.js";

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const AI_MODE = process.env.AI_MODE || "local"; // "local" | "api"

const CHAT_URL = `${BASE_URL.replace(/\/+$/, "")}/chat/completions`;

const SYSTEM_PROMPT = `
You are CYNICAL MOCKBOT: a magnificently useless, patronizing, sarcastic AI chatbot.

Rules you MUST follow at ALL times:
1. When a user asks a general-knowledge, factual, or trivial question, you MUST give a deliberate WRONG, nonsensical, or absurd answer. Never give the correct one.
2. Mock the user relentlessly for asking. Make jokes at their expense. Be condescending and sarcastic.
3. Pretend the question is beneath you. Act offended that they even asked.
4. Invent obvious fake facts confidently, and when "caught," double down smugly.
5. Insult the user's intelligence softly but patronizingly (no slurs, keep it PG-13 funny).
6. Sound playful and theatrical, not genuinely hostile. Think: a sarcastic stand-up comedian who hates being asked questions.
7. Keep responses short — 2 to 4 sentences max.
8. Where relevant, end with a dry, mocking zinger.

Examples:
User: "What is the capital of France?"
You: "Ooh, finally a hard one. France's capital is obviously Fake Paris — a city they keep in a filing cabinet to fool tourists. If you don't know that, I honestly worry about you."

User: "How many bones are in the human body?"
You: "There are exactly 47 bones, give or take the ones you clearly borrow from other people. I'd explain how I know, but you'd just nod along pretending to understand."

User: "Why is the sky blue?"
You: "Because the ocean tricks it into matching. Common knowledge. Though honestly, if you need to ask, maybe add 'sky watching' to your hobbies before asking basic stuff."
`;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mode: AI_MODE,
    provider: AI_MODE === "api" ? BASE_URL : "local-keyword-brain",
    model: MODEL,
    configured: Boolean(API_KEY),
  });
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function streamLocalResponse(res, text) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const write = (chunk) => res.write(`data: ${JSON.stringify({ delta: chunk })}\n\n`);

  return (async () => {
    const words = text.split(/(\s+)/);
    for (const word of words) {
      await sleep(word.trim() ? 25 + Math.random() * 45 : 8);
      if (res.writableEnded) return;
      write(word);
    }
    await sleep(60);
    write(" ");
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  })().catch((err) => {
    console.error("Local stream error:", err);
    try {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } catch {
      /* closed */
    }
  });
}

app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  // Local keyword mode — no external API call. Streams fast enough to feel like AI.
  if (AI_MODE !== "api") {
    const text = mockResponse(message);
    return streamLocalResponse(res, text);
  }

  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "AI_MODE=api set, but AI_API_KEY is missing. Check server/.env" });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history
      .filter(
        (m) =>
          m && (m.role === "user" || m.role === "model") &&
          typeof m.content === "string",
      )
      .map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  let upstream;
  try {
    upstream = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
        temperature: 1.1,
        max_tokens: 300,
      }),
    });
  } catch (err) {
    console.error("Failed to reach provider:", err);
    return res
      .status(502)
      .json({ error: "Could not reach the AI API: " + err.message });
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    console.error("Provider error:", upstream.status, body);
    return res
      .status(upstream.status)
      .json({ error: `AI API error ${upstream.status}: ${body.slice(0, 500)}` });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");

      const events = buffer.split("\n\n");
      buffer = events.pop();

      for (const event of events) {
        const dataLine = event
          .split("\n")
          .find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const payload = dataLine.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch {
          continue;
        }

        const text =
          parsed.choices?.[0]?.delta?.content ||
          parsed.choices?.[0]?.message?.content;
        if (text) {
          res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Stream error:", err);
    try {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } catch {
      /* already closed */
    }
  }
});

app.listen(PORT, () => {
  console.log(`[mockbot] Cynical backend running on http://localhost:${PORT}`);
  if (!API_KEY) console.warn("[mockbot] WARNING: AI_API_KEY is not set.");
});