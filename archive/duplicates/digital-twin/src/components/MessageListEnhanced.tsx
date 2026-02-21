'use client';

import React, { useEffect, useRef } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import type { Message } from '@/types';
import { useState } from 'react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div className="space-y-4">
            <Bot size={48} className="mx-auto text-slate-500" />
            <h3 className="text-xl font-semibold text-slate-300">Start a Conversation</h3>
            <p className="text-slate-400 max-w-sm">
              Ask me about my experience, projects, skills, or anything else you'd like to know.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <Bot size={18} className="text-emerald-400" />
                </div>
              )}

              <div
                className={`max-w-2xl group ${
                  msg.role === 'user'
                    ? 'bg-emerald-600/30 border border-emerald-500/50 text-slate-100'
                    : 'bg-slate-800 border border-slate-700 text-slate-100'
                } rounded-lg px-4 py-3`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {msg.voice_url && (
                  <audio
                    src={msg.voice_url}
                    controls
                    className="mt-3 w-full h-8 bg-slate-900/50 rounded"
                  />
                )}

                <div className="mt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                  <User size={18} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <Bot size={18} className="text-emerald-400" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
