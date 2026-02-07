'use client';

import type { ChatMessageType } from '@/types';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isTyping?: boolean;
}

export function ChatMessages({ messages, isTyping = false }: ChatMessagesProps) {

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="chatMessages" className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const timestamp = formatTimestamp(msg.createdAt);
              return msg.role === 'assistant' ? (
                <AssistantMessage key={msg.id} content={msg.content} timestamp={timestamp} />
              ) : (
                <UserMessage key={msg.id} content={msg.content} timestamp={timestamp} />
              );
            })
          )}

          {isTyping && <TypingIndicator />}
        </div>
      </div>
    </div>
  );
}

function AssistantMessage({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div className="flex items-start space-x-3 chat-bubble-ai">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <div className="flex flex-col max-w-xl">
        <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white text-gray-900 shadow-lg border border-gray-100">
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-1">{timestamp}</span>
      </div>
    </div>
  );
}

function UserMessage({ content, timestamp }: { content: string; timestamp: string }) {
  return (
    <div className="flex items-start space-x-3 justify-end chat-bubble-user">
      <div className="flex flex-col max-w-xl items-end">
        <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl">
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-1">{timestamp}</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-lg border border-gray-100">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        </div>
      </div>
    </div>
  );
}
