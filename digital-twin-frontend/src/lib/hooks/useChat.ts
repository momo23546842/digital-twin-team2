import { useState, useCallback } from "react";
import { chatApi } from "@/lib/api/endpoints";
import type { ChatMessageType } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    // Add user message to state immediately (optimistic update)
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      userId: '',
      content,
      role: 'user',
      createdAt: new Date(),
    };

    // Create and add user message to the conversation immediately
    const userMessage: ChatMessageType = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Temporary ID with random suffix to avoid collisions
      userId: "current-user", // TODO: Replace with actual userId from auth context
      content,
      role: "user",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await chatApi.sendMessage(content);
      // Add assistant response
      setMessages((prev) => [...prev, response.data as ChatMessageType]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      // Remove user message on failure (rollback optimistic update)
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.getMessages(sessionId);
      setMessages(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    clearMessages,
  };
}
