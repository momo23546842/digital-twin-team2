"use client";
import { useState } from 'react';

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState('');

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = value.trim();
    if (!t) return;
    onSend(t);
    setValue('');
  }

  return (
    <form onSubmit={submit} className="chat-input-form">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Send a message..."
        className="chat-input"
      />
      <button type="submit" className="chat-send-btn">Send</button>
    </form>
  );
}
