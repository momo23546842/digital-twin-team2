import type { Message } from './types';

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {messages.map((m) => (
        <div key={m.id} style={{ padding: '12px 8px' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{m.role}</div>
          <div style={{ marginTop: 6, background: m.role === 'user' ? '#eef2ff' : '#f1f5f9', padding: 12, borderRadius: 8 }}>
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}
