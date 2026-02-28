"use client";
import { useEffect, useState } from 'react';

// Lightweight id generator to avoid adding an external dependency
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
import type { Message } from './types';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: genId(), role: 'system', text: 'You are connected to Digital Twin demo.', createdAt: new Date().toISOString() },
  ]);

  function send(text: string) {
    const userMsg: Message = { id: genId(), role: 'user', text, createdAt: new Date().toISOString() };
    setMessages((s) => [...s, userMsg]);

    // Call server API to get an assistant reply using Groq (or fallback mock)
    (async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, userMsg] }),
        });
        const data = await res.json();
        const replyText = data?.reply || data?.error || '(no reply)';
        const reply: Message = { id: genId(), role: 'assistant', text: String(replyText), createdAt: new Date().toISOString() };
        setMessages((s) => [...s, reply]);
      } catch (e) {
        const reply: Message = { id: genId(), role: 'assistant', text: `(error) ${(e as any)?.message || e}`, createdAt: new Date().toISOString() };
        setMessages((s) => [...s, reply]);
      }
    })();
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Assistant</h2>
      </div>
      <div className="chat-card">
        <MessageList messages={messages} />
        <ChatInput onSend={send} />
      </div>
    </div>
  );
}
