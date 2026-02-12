"use client";

import ChatInput from "@/components/ChatInput";
import DocumentUpload from "@/components/DocumentUpload";
import MessageList from "@/components/MessageList";
<<<<<<< HEAD
import VoiceChat from "@/components/VoiceChat";
import type { Message } from "@/types";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
=======
import type { Message } from "@/types";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
>>>>>>> origin/main

export default function ChatPane() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
<<<<<<< HEAD
        "Hey! 👋 I'm your Digital Twin - upload a resume, bio, or any personal docs and I'll become that person. Then you can chat with 'them' and I'll respond as if I were them! You can also use voice - just click 'Start Call' to have a conversation.",
=======
        "Hey! 👋 I'm your Digital Twin - upload a resume, bio, or any personal docs and I'll become that person. Then you can chat with 'them' and I'll respond as if I were them!",
>>>>>>> origin/main
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
<<<<<<< HEAD
  
  // Voice-related state
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>("");
=======
>>>>>>> origin/main

  useEffect(() => {
    // Initialize session ID
    setSessionId(`session-${Date.now()}`);
  }, []);

  const handleSendMessage = useCallback(async (content: string, inputMethod: 'text' | 'voice' = 'text') => {
    console.log('[ChatPane] handleSendMessage called:', { content, inputMethod });
    
    if (!content.trim()) {
      console.log('[ChatPane] Empty content, skipping');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
<<<<<<< HEAD
      console.log('[ChatPane] Sending to /api/chat...');
      
=======
>>>>>>> origin/main
      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-123", // Replace with actual user ID
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: "user", content },
          ],
          sessionId,
<<<<<<< HEAD
          input_method: inputMethod,
        }),
      });

      console.log('[ChatPane] Response status:', response.status);

      if (!response.ok) {
        // Read response text for better error details
        const responseText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        // Try to parse as JSON for structured error
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('[ChatPane] API Error:', {
            status: response.status,
            error: errorData,
            details: errorData.details,
          });
        } catch {
          // Not JSON, log raw text
          console.error('[ChatPane] API Error (raw):', {
            status: response.status,
            body: responseText.substring(0, 500),
          });
          errorMessage = responseText.substring(0, 100) || `Server error (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[ChatPane] Got response:', data);

      // Add assistant message
      setMessages((prev) => [...prev, data.message]);
      
      // Set last assistant message for TTS (voice output)
      if (autoSpeak && data.message?.content) {
        console.log('[ChatPane] Setting message for TTS:', data.message.content.substring(0, 50) + '...');
        setLastAssistantMessage(data.message.content);
      }
=======
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Add assistant message
      setMessages((prev) => [...prev, data.message]);
>>>>>>> origin/main
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId, autoSpeak]);

<<<<<<< HEAD
  // Handle voice transcript from VoiceChat component
  const handleVoiceTranscript = useCallback((text: string, inputMethod: 'voice') => {
    console.log('[ChatPane] Voice transcript received:', text);
    handleSendMessage(text, inputMethod);
  }, [handleSendMessage]);

=======
>>>>>>> origin/main
  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                  Digital Twin
                  <Sparkles className="w-5 h-5 text-violet-500" />
                </h1>
                <p className="text-sm text-gray-500">Powered by Groq AI with Vector Search</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-violet-600">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat container */}
      <div className="flex-1 flex flex-col relative z-10 p-4 sm:p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-gray-50 rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Messages */}
          <MessageList messages={messages} isLoading={isLoading} />

          {/* Bottom section inside bubble */}
          <div className="bg-white border-t border-gray-100">
            {/* Document Upload */}
            <DocumentUpload isLoading={isLoading} />
<<<<<<< HEAD

            {/* Voice Chat Controls */}
            <div className="px-4 py-3 border-t border-gray-100">
              <VoiceChat
                onTranscript={handleVoiceTranscript}
                textToSpeak={lastAssistantMessage}
                isEnabled={true}
                autoSpeak={autoSpeak}
                onAutoSpeakChange={setAutoSpeak}
                language="en-US"
              />
            </div>

            {/* Input */}
            <ChatInput onSubmit={(content) => handleSendMessage(content, 'text')} isLoading={isLoading} />
=======

            {/* Input */}
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
>>>>>>> origin/main
          </div>
        </div>
      </div>
    </div>
  );
}
