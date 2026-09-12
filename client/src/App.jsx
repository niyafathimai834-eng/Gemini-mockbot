import React, { useCallback, useEffect, useRef, useState } from "react";
import MessageBubble from "./components/MessageBubble.jsx";
import ChatInput from "./components/ChatInput.jsx";
import "./App.css";

const OPENING_MESSAGE = {
  role: "model",
  content:
    "Oh good, another tourist in the museum of useless questions. I'm CYNICAL MOCKBOT — your personal AI disappointment generator. Ask me anything. I promise to be magnificently, mockingly wrong.",
};

function parseSSE(reader, onDelta, onDone, onError) {
  const decoder = new TextDecoder();
  let buffer = "";

  function process() {
    const idx = buffer.indexOf("\n\n");
    if (idx === -1) return;
    const event = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 2);

    const dataLine = event
      .split("\n")
      .find((line) => line.startsWith("data:"));
    if (dataLine) {
      const payload = dataLine.slice(5).trim();
      if (payload) {
        try {
          const parsed = JSON.parse(payload);
          if (parsed.done) {
            onDone();
            return;
          }
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (parsed.delta) {
            onDelta(parsed.delta);
          }
        } catch {
          /* ignore malformed frames */
        }
      }
    }
    process();
  }

  return (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      process();
    }
    process();
    onDone();
  })();
}

function App() {
  const [messages, setMessages] = useState([OPENING_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const endRef = useRef(null);

  const scrollBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [messages, isStreaming, scrollBottom]);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isStreaming) return;

      const userMessage = { role: "user", content: text };
      const history = [...messages, userMessage];
      setMessages(history);
      setBotTyping(true);
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: history.filter((m) => m.role !== "system"),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || "Server error");
        }

        setMessages((prev) => [...prev, { role: "model", content: "" }]);

        const reader = res.body.getReader();
        await parseSSE(
          reader,
          (delta) => {
            setBotTyping(false);
            setMessages((prev) => {
              const next = [...prev];
              next[next.length - 1] = {
                role: "model",
                content: next[next.length - 1].content + delta,
              };
              return next;
            });
          },
          () => {
            setBotTyping(false);
            setIsStreaming(false);
          },
          (err) => {
            setBotTyping(false);
            setIsStreaming(false);
            setMessages((prev) => [
              ...prev,
              {
                role: "model",
                content: `Even my mocking broke down. Server says: ${err}`,
              },
            ]);
          }
        );
      } catch (err) {
        setBotTyping(false);
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: `I would mock you for this, but the server just exploded. Probably your fault. (${err.message})`,
          },
        ]);
      }
    },
    [messages, isStreaming]
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-mark">😈</div>
        <div>
          <h1>Cynical MockBot</h1>
          <p className="tagline">
            Powered by Gemini. Fueled by contempt. Answers are guaranteed wrong.
          </p>
        </div>
      </header>

      <main className="chat-window">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {botTyping && (
          <MessageBubble
            message={{ role: "model", content: "" }}
            typing={true}
          />
        )}
        <div ref={endRef} />
      </main>

      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}

export default App;