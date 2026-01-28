"use client";

import { Message } from "@/types";
import { useEffect, useRef, useState } from "react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

/** Format timestamp consistently to avoid hydration mismatches */
function formatTime(timestamp: Date | string): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes}:${seconds} ${ampm}`;
}

export default function MessageList({
  messages,
  isLoading = false,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-900 border border-gray-200"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span
                className="text-xs opacity-70 mt-1 block"
                suppressHydrationWarning
              >
                {mounted ? formatTime(msg.timestamp) : ""}
              </span>
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
