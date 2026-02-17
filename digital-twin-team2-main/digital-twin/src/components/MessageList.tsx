"use client";

import { Message } from "@/types";
import { Bot, User } from "lucide-react";
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
      className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-gray-50"
    >
      <div className="space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-6 shadow-lg">
              <div className="w-10 h-10 text-violet-500">
                <Bot size={40} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a Conversation</h3>
            <p className="text-gray-500 max-w-md">
              Upload some documents to create your digital twin, then start chatting!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 ${msg.role === "user" ? "ml-2" : "mr-2"}`}>
                <div 
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shadow-md
                    ${msg.role === "user" 
                      ? "bg-gradient-to-br from-cyan-500 to-teal-500" 
                      : "bg-gradient-to-br from-violet-500 to-purple-600"
                    }
                  `}
                >
                  {msg.role === "user" ? (
                    <div className="w-5 h-5 text-white"><User size={20} /></div>
                  ) : (
                    <div className="w-5 h-5 text-white"><Bot size={20} /></div>
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
                    px-5 py-3 rounded-full transition-all duration-200
                    ${msg.role === "user"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-gray-100 text-gray-800"
                    }
                  `}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span
                  className={`
                    text-[11px] text-gray-400 mt-1.5 block
                    ${msg.role === "user" ? "text-right mr-1" : "text-left ml-1"}
                  `}
                  suppressHydrationWarning
                >
                  {mounted && msg.timestamp ? formatTime(msg.timestamp) : ""}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex-shrink-0 mr-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                <div className="w-5 h-5 text-white"><Bot size={20} /></div>
              </div>
            </div>
            <div className="bg-gray-100 px-5 py-4 rounded-full">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
