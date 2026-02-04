"use client";

import { Message } from "@/types";
import { Bot, User, Copy, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

function formatTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function MessageList({
  messages,
  isLoading = false,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[var(--background)]"
    >
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[var(--primary)] rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-xl">
                <Bot className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Start a Conversation
            </h3>
            <p className="text-[var(--foreground-muted)] max-w-md text-sm leading-relaxed">
              Upload some documents to create your digital twin, then start chatting!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } animate-message-appear`}
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div 
                  className={`
                    relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110
                    ${msg.role === "user" 
                      ? "bg-gradient-to-br from-[var(--accent)] to-blue-600" 
                      : "bg-gradient-to-br from-[var(--primary)] to-emerald-600"
                    }
                  `}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Message bubble */}
              <div
                className={`
                  group relative max-w-[85%] sm:max-w-[75%]
                  ${msg.role === "user" ? "items-end" : "items-start"}
                `}
              >
                <div
                  className={`
                    relative px-4 py-3 rounded-2xl transition-all duration-300
                    ${msg.role === "user"
                      ? "bg-gradient-to-br from-[var(--accent)] to-blue-600 text-white rounded-tr-sm"
                      : "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] rounded-tl-sm hover:border-[var(--border-hover)]"
                    }
                  `}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  {/* Copy button for assistant messages */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="absolute -right-2 -bottom-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-all duration-300 shadow-lg"
                      aria-label="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <span
                  className={`
                    text-[10px] text-[var(--foreground-muted)] mt-1.5 block opacity-60
                    ${msg.role === "user" ? "text-right mr-1" : "text-left ml-1"}
                  `}
                  suppressHydrationWarning
                >
                  {mounted ? formatTime(msg.timestamp) : ""}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 animate-message-appear">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-emerald-600 flex items-center justify-center shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] px-5 py-4 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing-1" />
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing-2" />
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing-3" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
