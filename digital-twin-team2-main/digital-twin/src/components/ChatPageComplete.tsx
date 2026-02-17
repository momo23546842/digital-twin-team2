'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, Settings, LogOut, History } from 'lucide-react';
import MessageList from '@/components/MessageListEnhanced';
import ChatInputEnhanced from '@/components/ChatInputEnhanced';
import ContactForm from '@/components/ContactForm';
import CallScreen from '@/components/CallScreen';
import type { Message, Conversation } from '@/types';

interface ChatPageProps {
  initialSessionId?: string;
}

export default function ChatPage({ initialSessionId }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi there! 👋 I'm your Digital Twin AI assistant. I can tell you about my background, experience, skills, and projects. Feel free to ask me anything - from technical questions to career opportunities. You can also use voice to talk with me, or if you'd like to connect, just share your contact info!`,
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(initialSessionId || '');
  const [conversationId, setConversationId] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
  
  // Call screen state
  const [isCallOpen, setIsCallOpen] = useState(false);

  // Initialize session
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  // Initialize conversation
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          setConversationId(data.conversation.id);
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
      }
    };

    if (sessionId) {
      initializeConversation();
    }
  }, [sessionId]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/conversations?limit=10');
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data.conversations);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    fetchHistory();
  }, []);

  // Call handlers
  const handleStartCall = useCallback(() => {
    setIsCallOpen(true);
  }, []);

  const handleEndCall = useCallback(() => {
    setIsCallOpen(false);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !conversationId) return;

    // Add user message to state
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          session_id: sessionId,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      // Add assistant message
      setMessages((prev) => [...prev, data.message]);

      // Track event
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'message_sent',
          conversation_id: conversationId,
          event_data: {
            message_length: content.length,
            response_length: data.message.content.length,
          },
        }),
      }).catch(console.error);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hi there! 👋 I'm your Digital Twin AI assistant. I can tell you about my background, experience, skills, and projects. Feel free to ask me anything - from technical questions to career opportunities. You can also use voice to talk with me, or if you'd like to connect, just share your contact info!`,
        timestamp: new Date(),
      },
    ]);
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setSessionId(newSessionId);
  };

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div
        className={`bg-slate-800 border-r border-slate-700 w-64 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64 fixed h-full z-50'
        }`}
      >
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Digital Twin
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={startNewChat}
            className="w-full text-left px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium transition-colors"
          >
            + New Chat
          </button>

          <div className="pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Recent
            </h3>
            {chatHistory.length > 0 ? (
              chatHistory.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setConversationId(conv.id);
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 rounded transition-colors text-sm truncate"
                >
                  {conv.title || 'Conversation'}
                </button>
              ))
            ) : (
              <p className="px-4 py-2 text-xs text-slate-500">No recent chats</p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-700 p-4 space-y-2">
          <button className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded transition-colors text-sm">
            <Settings size={18} />
            Settings
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded transition-colors text-sm text-left">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-300 hover:text-white transitions-colors md:hidden"
            >
              <Sidebar size={24} />
            </button>
            <h1 className="text-xl font-semibold text-white">Chat</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors text-sm"
            >
              {showContactForm ? 'Hide Contact Form' : 'Share Contact'}
            </button>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex gap-6 overflow-hidden p-6">
          {/* Messages */}
          <div className="flex-1 flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden relative">
            <MessageList messages={messages} isLoading={isLoading} />
            
            <ChatInputEnhanced
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={!conversationId}
              onStartCall={handleStartCall}
              isInCall={isCallOpen}
            />
          </div>

          {/* Sidebar Panel */}
          {showContactForm && (
            <div className="w-80 bg-slate-800 border border-slate-700 rounded-lg p-6 overflow-y-auto">
              <h2 className="text-lg font-semibold text-white mb-4">Share Your Contact</h2>
              <ContactForm
                conversationId={conversationId}
                onSuccess={() => {
                  // Optional: show success message or auto-hide form
                }}
              />

              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">💡 Why share?</h3>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li>• Let me follow up with opportunities</li>
                  <li>• Schedule meetings directly</li>
                  <li>• Get personalized recommendations</li>
                  <li>• Stay updated on news</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Call Screen Overlay */}
      <CallScreen
        isOpen={isCallOpen}
        contactName="Digital Twin"
        onEndCall={handleEndCall}
        onClose={handleEndCall}
      />
    </div>
  );
}
