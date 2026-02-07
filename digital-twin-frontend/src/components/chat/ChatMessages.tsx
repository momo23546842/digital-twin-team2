'use client';

import { useState } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatMessagesProps {
  isTyping?: boolean;
}

export function ChatMessages({ isTyping = false }: ChatMessagesProps) {
  const [messages] = useState<ChatMessage[]>([
    {
      id: '1',
      content:
        "Hello! I'm your Digital Twin. I can help answer questions about your background, schedule meetings, or provide insights about your career. What would you like to know?",
      role: 'assistant',
      timestamp: 'Just now',
    },
    {
      id: '2',
      content:
        "Hi! I'm looking for a senior developer with Next.js experience. Can you tell me about your background?",
      role: 'user',
      timestamp: 'Just now',
    },
  ]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="chatMessages" className="space-y-6">
          {messages.map((msg) =>
            msg.role === 'assistant' ? (
              <AssistantMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
            ) : (
              <UserMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
            )
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
