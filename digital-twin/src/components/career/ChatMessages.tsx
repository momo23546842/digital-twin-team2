"use client";

import { Message } from "@/types";
import { Bot, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatMessagesProps {
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

export default function ChatMessages({ messages, isLoading = false }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[var(--surface)]"
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            index={index}
            mounted={mounted}
          />
        ))
      )}

      {/* Typing indicator */}
      {isLoading && <TypingIndicator />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
        <Bot className="w-8 h-8 text-[var(--accent)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        Welcome to Career AI
      </h3>
      <p className="text-[var(--muted)] max-w-md text-sm">
        I can help you with career advice, resume reviews, interview preparation, and job search strategies.
      </p>
    </div>
  );
}

function MessageBubble({
  message,
  index,
  mounted,
}: {
  message: Message;
  index: number;
  mounted: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md ${
            isUser
              ? "bg-[var(--accent)]"
              : "bg-[var(--primary)] dark:bg-[var(--primary-light)]"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Message content */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-lg shadow-sm ${
            isUser
              ? "bg-[var(--accent)] text-white rounded-tr-none"
              : "bg-white dark:bg-[var(--primary-light)] text-[var(--foreground)] rounded-tl-none"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <span
          className={`text-[10px] text-[var(--muted)] mt-1 block ${
            isUser ? "text-right mr-1" : "text-left ml-1"
          }`}
          suppressHydrationWarning
        >
          {mounted ? formatTime(message.timestamp) : ""}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-[var(--primary)] dark:bg-[var(--primary-light)] flex items-center justify-center shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="bg-white dark:bg-[var(--primary-light)] px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
}
