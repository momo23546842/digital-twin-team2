import type { Message } from './types';

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="chat-messages">
      {messages.map((m) => (
        <div key={m.id} className={`message message-${m.role}`}>
          <div className="message-role">{m.role}</div>
          <div className="message-bubble">
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}
