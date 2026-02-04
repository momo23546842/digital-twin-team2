"use client";

import ChatInput from "@/components/ChatInput";
import DocumentUpload from "@/components/DocumentUpload";
import MessageList from "@/components/MessageList";
import type { Message } from "@/types";
import { Bot, Sparkles, Zap, Shield, Brain } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm your Digital Twin - upload a resume, bio, or any personal docs and I'll become that person. Then you can chat with 'them' and I'll respond as if I were them!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-123",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }],
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
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
    <div className="flex flex-col h-screen relative overflow-hidden bg-[var(--background)]">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-[100px] animate-float delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[var(--primary)]/3 to-transparent rounded-full" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 glass border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-[var(--primary)] rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full border-2 border-[var(--background)] animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <span className="gradient-text">Digital Twin</span>
                  <Sparkles className="w-5 h-5 text-[var(--primary)] animate-pulse" />
                </h1>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                  Powered by Groq AI with Vector Search
                </p>
              </div>
            </div>

            {/* Feature badges */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors">
                <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span className="text-xs text-[var(--foreground-muted)]">Fast</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-colors">
                <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="text-xs text-[var(--foreground-muted)]">Secure</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors">
                <Brain className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span className="text-xs text-[var(--foreground-muted)]">Smart</span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)]">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" />
              </div>
              <span className="text-sm text-[var(--foreground-muted)] hidden sm:inline">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat container */}
      <div className="flex-1 flex flex-col relative z-10 p-3 sm:p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col glass rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden hover-lift">
          {/* Messages */}
          <MessageList messages={messages} isLoading={isLoading} />

          {/* Bottom section */}
          <div className="bg-[var(--background-secondary)] border-t border-[var(--border)]">
            {/* Document Upload */}
            <DocumentUpload isLoading={isLoading} />

            {/* Input */}
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="hidden sm:flex justify-center mt-4">
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <kbd className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px]">Enter</kbd>
            <span>to send</span>
            <span className="mx-2 text-[var(--border)]">|</span>
            <kbd className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px]">Shift + Enter</kbd>
            <span>for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
