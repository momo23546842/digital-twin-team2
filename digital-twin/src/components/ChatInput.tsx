"use client";

import { Send, Sparkles, ArrowUp } from "lucide-react";
import { FormEvent, useState, KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = "Ask your digital twin anything...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5">
      <div 
        className={`
          relative flex items-end gap-3 
          bg-[var(--surface)] rounded-2xl border transition-all duration-300
          ${isFocused 
            ? 'border-[var(--primary)]/50 shadow-lg shadow-[var(--primary)]/10' 
            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
          }
        `}
      >
        {/* AI indicator */}
        <div className="pl-4 pb-4">
          <div className={`p-2 rounded-xl transition-all duration-300 ${isFocused ? 'bg-[var(--primary)]/20' : 'bg-[var(--background)]'}`}>
            <Sparkles className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]'}`} />
          </div>
        </div>

        {/* Input field */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent py-4 text-sm sm:text-base text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none disabled:cursor-not-allowed resize-none leading-relaxed"
        />

        {/* Character count */}
        {input.length > 0 && (
          <div className="absolute bottom-1.5 right-16 text-[10px] text-[var(--foreground-muted)]">
            {input.length}
          </div>
        )}

        {/* Send button */}
        <div className="pr-3 pb-3">
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`
              relative p-3 rounded-xl font-medium flex items-center justify-center transition-all duration-300 btn-interactive focus-ring
              ${input.trim() && !isLoading
                ? 'bg-gradient-to-r from-[var(--primary)] to-emerald-500 text-white shadow-lg shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50 hover:scale-105 active:scale-95'
                : 'bg-[var(--background)] text-[var(--foreground-muted)] cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
