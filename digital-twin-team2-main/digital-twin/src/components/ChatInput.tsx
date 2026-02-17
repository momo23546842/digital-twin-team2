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
  placeholder = "Ask your digital twin anything...",
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
          bg-white rounded-2xl border-2 transition-all duration-300 shadow-sm
          ${isFocused 
            ? 'border-violet-400 shadow-lg shadow-violet-100' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
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
          className="flex-1 bg-transparent py-5 text-lg text-gray-800 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
        />

        {/* Voice button (decorative) */}
        <button
          type="button"
          className="p-3 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-xl transition-all"
          aria-label="Voice input"
        >
          <Mic className="w-6 h-6" />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`
            mr-3 p-4 rounded-xl font-medium flex items-center gap-2 transition-all duration-300
            ${input.trim() && !isLoading
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:scale-105 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-6 h-6" />
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-gray-400">
        Press Enter to send • Your digital twin responds based on uploaded documents
      </p>
    </form>
  );
}
