"use client";

import ChatInput from "@/components/ChatInput";
import DocumentUpload from "@/components/DocumentUpload";
import MessageList from "@/components/MessageList";
import type { Message } from "@/types";
import PhoneDialer from "@/components/PhoneDialer";
import { useAuth } from '@/lib/auth-context';
import { Bot, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Enhanced ChatPane that includes the PhoneDialer floating button.
 * Drop-in replacement for the original ChatPane.
 */
export default function ChatPaneWithPhone() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! 👋 I'm your Digital Twin - upload a resume, bio, or any personal docs and I'll become that person. Then you can chat with 'them' and I'll respond as if I were them!\n\n📞 You can also click the green phone button to make an AI phone call!",
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
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-[#0f0f1a]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header (sticky) */}
      <header className="sticky top-0 left-0 right-0 z-30 bg-[#16213e] text-white border-b border-[#0f1724]/40 h-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 h-full flex items-center">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#075E54]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#075E54] animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  Digital Twin
                </h1>
                <p className="text-xs sm:text-sm text-white/80">Powered by Groq AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LogoutButton />
              <PhoneDialer />
            </div>
          </div>
        </div>
      </header>

      {/* Main chat container */}
      <div className="flex-1 flex flex-col relative z-10 pb-24 p-4 sm:p-6 overflow-hidden">
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col bg-white rounded-3xl border border-[#0b1220] shadow-lg overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>

          <div className="w-full bg-white border-t border-gray-100">
            <DocumentUpload isLoading={isLoading} />
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Phone Dialer panel will render when opened via the header button */}
    </div>
  );
}

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={() => {
        try {
          logout();
        } catch (e) {
          console.error('Logout failed', e);
        }
      }}
      className="flex items-center gap-2 px-3 py-2 min-h-[44px] text-sm text-white/90 hover:text-white border border-white/10 rounded-md"
      aria-label="Logout"
    >
      <LogOut className="w-4 h-4 text-white/90 sm:hidden" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
