"use client";

import ChatInput from "@/components/ChatInput";
import DocumentUpload from "@/components/DocumentUpload";
import MessageList from "@/components/MessageList";
import type { Message } from "@/types";
import { Bot } from "lucide-react";
import PhoneDialer from "@/components/PhoneDialer";
import { useEffect, useState } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! 👋 I'm your Digital Twin - upload a resume, bio, or any personal docs and I'll become that person. Then you can chat with 'them' and I'll respond as if I were them!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Initialize session ID
    setSessionId(`session-${Date.now()}`);
  }, []);

  const handleSendMessage = async (content: string) => {
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error("API Error Response:", errorData);
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      // Add assistant message
      setMessages((prev) => [...prev, data.message]);
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
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#0f0f1a]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header (fixed) */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#16213e] text-white border-b border-[#0f1724]/40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
                  <Bot className="w-6 h-6 text-[#075E54]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#075E54] animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  Digital Twin
                </h1>
                <p className="text-sm text-white/80">Powered by Groq AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PhoneDialer />
            </div>
          </div>
        </div>
      </header>

      {/* Main chat container (pad for fixed header and input) */}
      <div className="flex-1 flex flex-col relative z-10 pt-20 pb-24 p-4 sm:p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-white rounded-3xl border border-[#0b1220] shadow-lg overflow-hidden">
          {/* Messages (takes available space and scrolls) */}
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>

          {/* Bottom fixed input area */}
          <div className="w-full bg-white border-t border-gray-100">
            <DocumentUpload isLoading={isLoading} />
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
