function MessageBubble({ message, typing = false }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "bot"}`}>
      <div className={`message-bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
        {typing ? (
          <div className="typing-dots" aria-label="MockBot is thinking">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className="message-content">
            {isUser ? (
              message.content
            ) : (
              message.content ||
              (typing ? "" : "…")
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;