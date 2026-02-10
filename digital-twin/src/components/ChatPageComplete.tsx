'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, Settings, LogOut, History } from 'lucide-react';
import MessageList from '@/components/MessageListEnhanced';
import ChatInputEnhanced from '@/components/ChatInputEnhanced';
import ContactForm from '@/components/ContactForm';
import VoiceChat from '@/components/VoiceChat';
import { useAuth } from '@/lib/auth-context';
import type { Message, Conversation } from '@/types';

// Extended message type with input method tracking
interface ExtendedMessage extends Message {
  input_method?: 'text' | 'voice';
  voice_transcript?: string;
}

interface ChatPageProps {
  initialSessionId?: string;
}

export default function ChatPage({ initialSessionId }: ChatPageProps) {
  const { logout, user } = useAuth();
  const [messages, setMessages] = useState<ExtendedMessage[]>([
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
  
  // Voice-related state
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>('');

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

  const handleSendMessage = useCallback(async (content: string, inputMethod: 'text' | 'voice' = 'text') => {
    console.log('[ChatPage] handleSendMessage called:', { content, inputMethod, conversationId });
    
    if (!content.trim()) {
      console.log('[ChatPage] Empty content, skipping');
      return;
    }
    if (!conversationId) {
      console.log('[ChatPage] No conversationId yet, skipping');
      return;
    }

    // Add user message to state with input method tracking
    const userMessage: ExtendedMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      input_method: inputMethod,
      voice_transcript: inputMethod === 'voice' ? content : undefined,
    };

    console.log('[ChatPage] Adding user message:', userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('[ChatPage] Sending to /api/chat...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          session_id: sessionId,
          conversation_id: conversationId,
          input_method: inputMethod,
        }),
      });

      console.log('[ChatPage] Response status:', response.status);

      if (!response.ok) {
        // Read response text for better error details
        const responseText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        // Try to parse as JSON for structured error
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('[ChatPage] API Error:', {
            status: response.status,
            error: errorData,
            details: errorData.details,
          });
        } catch {
          // Not JSON, log raw text
          console.error('[ChatPage] API Error (raw):', {
            status: response.status,
            body: responseText.substring(0, 500),
          });
          errorMessage = responseText.substring(0, 100) || `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[ChatPage] Got response:', data);

      // Add assistant message and set for TTS
      const assistantMessage: ExtendedMessage = {
        ...data.message,
        input_method: 'text', // AI responses are always text
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Set last assistant message for TTS (only for voice input or if auto-speak is on)
      if (autoSpeak) {
        console.log('[ChatPage] Setting message for TTS:', data.message.content.substring(0, 50) + '...');
        setLastAssistantMessage(data.message.content);
      }

      // Track event with input method
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'message_sent',
          conversation_id: conversationId,
          event_data: {
            message_length: content.length,
            response_length: data.message.content.length,
            input_method: inputMethod,
          },
        }),
      }).catch(console.error);
    } catch (error) {
      console.error('[ChatPage] Error sending message:', error);
      const errorMessage: ExtendedMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, messages, sessionId, autoSpeak]);

  // Handle voice transcript from VoiceChat component
  const handleVoiceTranscript = useCallback((text: string, inputMethod: 'voice') => {
    console.log('[ChatPage] Voice transcript received:', text);
    handleSendMessage(text, inputMethod);
  }, [handleSendMessage]);

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
        className={`bg-slate-800 border-r border-slate-700 w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'relative' : 'fixed -translate-x-full h-full z-50 md:relative md:translate-x-0'
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
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded transition-colors text-sm text-left"
          >
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
          <div className="flex-1 flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <MessageList messages={messages} isLoading={isLoading} />
            
            {/* Voice Chat Controls */}
            <div className="border-t border-slate-700 p-4">
              <VoiceChat
                onTranscript={handleVoiceTranscript}
                textToSpeak={lastAssistantMessage}
                isEnabled={true}
                autoSpeak={autoSpeak}
                onAutoSpeakChange={setAutoSpeak}
                language="en-US"
              />
            </div>
            
            <ChatInputEnhanced
              onSendMessage={(content) => handleSendMessage(content, 'text')}
              isLoading={isLoading}
              disabled={!conversationId}
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
    </div>
  );
}
