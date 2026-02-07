'use client';

import Navigation from '@/components/layout/Navigation';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { QuickActions } from '@/components/chat/QuickActions';
import { ChatInputArea } from '@/components/chat/ChatInputArea';
import { useChat } from '@/lib/hooks/useChat';
import { useEffect } from 'react';

export default function ChatPage() {
  const { messages, isLoading, sendMessage } = useChat();

  // Initialize with a welcome message if no messages exist
  // In production, this should be handled by the backend or chat initialization logic
  useEffect(() => {
    if (messages.length === 0) {
      // Messages will be empty initially and loaded from the backend
      // The useChat hook will handle fetching messages when needed
    }
  }, [messages.length]);

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    sendMessage(action);
  };

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    sendMessage(message);
  };

  return (
    <>
      <Navigation />
      <div className="content-wrapper h-screen flex flex-col">
        {/* Chat Header */}
        <div className="glass-effect border-b border-white/30 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your Digital Twin</h2>
                  <p className="text-sm text-gray-600">Active • Responds instantly</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-700 hover:bg-white rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
                <button className="p-2 text-gray-700 hover:bg-white rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ChatMessages messages={messages} isTyping={isLoading} />

        {/* Quick Actions */}
        <QuickActions onActionClick={handleQuickAction} />

        {/* Input Area */}
        <ChatInputArea onSendMessage={handleSendMessage} />
      </div>
    </>
  );
}
