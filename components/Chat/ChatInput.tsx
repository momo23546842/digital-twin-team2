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
    <form onSubmit={submit} style={{ maxWidth: 800, margin: '16px auto', display: 'flex', gap: 8, padding: '0 8px' }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Send a message..."
        style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9ee' }}
      />
      <button type="submit" style={{ padding: '10px 14px', borderRadius: 8 }}>Send</button>
    </form>
  );
}
