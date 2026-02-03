"use client";

import { AnimatePresence, motion } from "framer-motion";
import Avatar from "@/components/Avatar";
import { Message } from "@/types";
import { useEffect, useRef, useState } from "react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  streamingContent?: string;
  personaName?: string;
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

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function MessageList({
  messages,
  isLoading = false,
  isStreaming = false,
  streamingContent = "",
  personaName = "Alex",
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
  }, [messages, streamingContent]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="space-y-6">
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full text-center py-20"
          >
            <Avatar name={personaName} size="lg" isAssistant={true} />
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
              Start a Conversation with {personaName}
            </h3>
            <p className="text-gray-500 max-w-md">
              Upload some documents to create your digital twin, then start chatting!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  delay: index * 0.05 
                }}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  <Avatar
                    name={msg.role === "assistant" ? personaName : "You"}
                    isAssistant={msg.role === "assistant"}
                    size="sm"
                  />
                </div>

                {/* Message content */}
                <div
                  className={`
                    flex flex-col max-w-[80%] sm:max-w-[70%]
                    ${msg.role === "user" ? "items-end" : "items-start"}
                  `}
                >
                  {/* Name label */}
                  <span className="text-xs font-medium text-gray-500 mb-1 px-1">
                    {msg.role === "assistant" ? personaName : "You"}
                  </span>

                  {/* Message bubble */}
                  <div
                    className={`
                      px-4 py-3 rounded-2xl transition-all duration-200 shadow-sm
                      ${msg.role === "user"
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-tr-md"
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-md"
                      }
                    `}
                  >
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span
                    className="text-[11px] text-gray-400 mt-1 px-1"
                    suppressHydrationWarning
                  >
                    {mounted ? formatTime(msg.timestamp) : ""}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 mt-1">
              <Avatar name={personaName} isAssistant={true} isThinking={true} size="sm" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-gray-500 mb-1 px-1">
                {personaName}
              </span>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md border border-gray-100 shadow-sm">
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 ml-1 bg-violet-500 animate-cursor-blink" />
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Typing indicator (when loading but no streaming content yet) */}
        {isLoading && !streamingContent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 mt-1">
              <Avatar name={personaName} isAssistant={true} isThinking={true} size="sm" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-gray-500 mb-1 px-1">
                {personaName}
              </span>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500 mr-2">typing</span>
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
