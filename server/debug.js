import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3002;
const API_KEY = process.env.GEMINI_API_KEY;
const SYSTEM_TEST = process.env.SYSTEM_TEST === "1";

const qs = SYSTEM_TEST ? "" : "";
const URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL)}:streamGenerateContent?alt=sse&key=${API_KEY}`;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  const contents = [
    ...(history || []).filter((m) => m.role && m.content).map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let upstream;
  try {
    upstream = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: SYSTEM_TEST ? { parts: [{ text: "You answer with absurd wrong facts and mock the user." }] } : undefined,
        generationConfig: { temperature: 1.1, topP: 0.95, maxOutputTokens: 300 },
      }),
    });
  } catch (e) {
    console.error("[debug] fetch threw:", e.message);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
    return;
  }

  console.error("[debug] upstream ok:", upstream.ok, "status:", upstream.status);

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    console.error("[debug] upstream body:", body.slice(0, 500));
    res.write(`data: ${JSON.stringify({ error: body.slice(0, 500) })}\n\n`);
    res.end();
    return;
  }

  try {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      console.error("[debug] chunk-repr:", JSON.stringify(buffer).slice(-260));
      console.error("[debug] has-nn:", buffer.includes("\n\n"), "has-rn-nn:", buffer.includes("\r\n\r\n"), "len:", buffer.length);

      const events = buffer.split("\n\n");
      buffer = events.pop();

      for (const event of events) {
        const dataLine = event.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const payload = dataLine.slice(5).trim();
        if (!payload) continue;

        let parsed;
        try {
          parsed = JSON.parse(payload);
        } catch {
          console.error("[debug] JSON parse failed on:", JSON.stringify(payload.slice(0, 80)));
          continue;
        }

        const text = parsed.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("");
        console.error("[debug] parsed text:", JSON.stringify(text));
        if (text) {
          res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("[debug] stream error:", err);
  }
});

app.listen(PORT, () => console.error(`[debug] listening on ${PORT}`));