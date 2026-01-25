"use client";

import ChatInput from "@/components/ChatInput";
import DocumentUpload from "@/components/DocumentUpload";
import MessageList from "@/components/MessageList";
import type { Message } from "@/types";
import { useEffect, useState } from "react";

export default function ChatPane() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Digital Twin! I'm an AI assistant powered by Groq. Upload documents to build your knowledge base, then ask me questions about them.",
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
        throw new Error(`API error: ${response.statusText}`);
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Digital Twin</h1>
        <p className="text-sm text-gray-500">Powered by Groq AI with Vector Search</p>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Document Upload */}
      <DocumentUpload isLoading={isLoading} />

      {/* Input */}
      <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
