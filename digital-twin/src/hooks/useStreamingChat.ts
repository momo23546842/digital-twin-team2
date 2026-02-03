"use client";

import { useCallback, useState } from "react";
import type { Message } from "@/types";
import type { PersonaSettings } from "@/lib/persona";

interface UseStreamingChatOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

interface UseStreamingChatReturn {
  sendMessage: (
    content: string,
    messages: Message[],
    sessionId: string,
    personaSettings?: PersonaSettings
  ) => Promise<string>;
  isStreaming: boolean;
  error: Error | null;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}): UseStreamingChatReturn {
  const { onChunk, onComplete, onError } = options;
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (
      content: string,
      messages: Message[],
      sessionId: string,
      personaSettings?: PersonaSettings
    ): Promise<string> => {
      setIsStreaming(true);
      setError(null);
      let fullContent = "";

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
            personaSettings,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              
              if (data === "[DONE]") {
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullContent += parsed.text;
                  onChunk?.(parsed.text);
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.startsWith("data: ")) {
          const data = buffer.slice(6).trim();
          if (data && data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                onChunk?.(parsed.text);
              }
            } catch {
              // Ignore
            }
          }
        }

        onComplete?.(fullContent);
        return fullContent;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [onChunk, onComplete, onError]
  );

  return {
    sendMessage,
    isStreaming,
    error,
  };
}
