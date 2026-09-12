import { useState } from "react";

function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  return (
    <form className="chat-input" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Ask me something... you WILL regret it e.g. "what is the capital of france"'
        disabled={disabled}
        autoComplete="off"
        className="chat-input-field"
      />
      <button type="submit" disabled={disabled || !text.trim()} className="send-btn">
        {disabled ? "…" : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;