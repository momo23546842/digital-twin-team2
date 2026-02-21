"use client";

import { Mic, Send, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5">
      <div 
        className={`
          relative flex items-center gap-4 
          bg-[#0f1724] rounded-2xl border-2 transition-all duration-300 shadow-sm
          ${isFocused 
            ? 'border-[#4361ee] shadow-lg shadow-[#4361ee]/10' 
            : 'border-transparent'
          }
        `}
      >
        {/* AI indicator */}
        <div className="pl-5">
          <Sparkles className={`w-6 h-6 transition-colors duration-300 ${isFocused ? 'text-violet-500' : 'text-gray-400'}`} />
        </div>

        {/* Input field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent py-5 text-lg text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
        />

        {/* Voice button (decorative) */}
        <button
          type="button"
          className="p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          aria-label="Voice input"
        >
          <Mic className="w-6 h-6" />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`
            mr-3 p-3 rounded-full font-medium flex items-center gap-2 transition-all duration-300
            ${input.trim() && !isLoading
              ? 'bg-[#4361ee] text-white shadow-md hover:scale-105 active:scale-95'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-gray-400">
        Press Enter to send • Your digital twin responds based on uploaded documents
      </p>
    </form>
  );
}
