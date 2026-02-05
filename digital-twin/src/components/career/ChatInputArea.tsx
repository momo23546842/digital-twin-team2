"use client";

import { Mic, MicOff, Send } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface ChatInputAreaProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
}

export default function ChatInputArea({
  onSubmit,
  isLoading = false,
  onVoiceStart,
  onVoiceEnd,
}: ChatInputAreaProps) {
  const [input, setInput] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit(input.trim());
        setInput("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  };

  const toggleVoice = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      onVoiceEnd?.();
    } else {
      setIsVoiceActive(true);
      onVoiceStart?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-[var(--primary)] border-t border-[var(--border)]">
      <div className="flex items-end gap-3">
        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading || isVoiceActive}
            rows={1}
            className="w-full px-4 py-3 bg-[var(--surface)] dark:bg-[var(--primary-light)] text-[var(--foreground)] placeholder-[var(--muted)] rounded-lg border border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none resize-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          />
        </div>

        {/* Voice button */}
        <button
          type="button"
          onClick={toggleVoice}
          disabled={isLoading}
          className={`p-3 rounded-lg transition-all duration-200 ${
            isVoiceActive
              ? "bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/30"
              : "bg-[var(--surface)] dark:bg-[var(--primary-light)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-light)] dark:hover:bg-[var(--border)]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isVoiceActive ? "Stop voice input" : "Start voice input"}
        >
          {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim() || isVoiceActive}
          className={`p-3 rounded-lg transition-all duration-200 ${
            input.trim() && !isLoading && !isVoiceActive
              ? "bg-[var(--accent)] text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30 hover:bg-[var(--accent-light)] hover:shadow-lg"
              : "bg-[var(--surface)] dark:bg-[var(--primary-light)] text-[var(--muted)] cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
