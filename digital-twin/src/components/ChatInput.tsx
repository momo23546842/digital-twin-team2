"use client";

import { motion } from "framer-motion";
import { useVoice } from "@/hooks/useVoice";
import { Mic, MicOff, Send, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

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

  const { 
    isListening, 
    transcript, 
    isSupported, 
    startListening, 
    stopListening 
  } = useVoice({
    onFinalTranscript: (text) => {
      // When speech recognition completes, submit the message
      if (text.trim()) {
        onSubmit(text.trim());
      }
    },
  });

  // Update input field with interim transcript while listening
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [isListening, transcript]);

  // Clear input when listening stops
  useEffect(() => {
    if (!isListening && transcript === "") {
      setInput("");
    }
  }, [isListening, transcript]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isListening) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5">
      <motion.div 
        animate={{ 
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          relative flex items-center gap-4 
          bg-white rounded-2xl border-2 transition-all duration-300 shadow-sm
          ${isFocused 
            ? 'border-violet-400 shadow-lg shadow-violet-100/50' 
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

        {/* Voice button */}
        {isSupported && (
          <motion.button
            type="button"
            onClick={toggleVoice}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-3 rounded-xl transition-colors
              ${isListening 
                ? 'text-red-500 bg-red-50 animate-pulse' 
                : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            title={isListening ? "Click to stop" : "Click to speak"}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </motion.button>
        )}

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={isLoading || !input.trim()}
          whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
          whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
          className={`
            mr-3 p-4 rounded-xl font-medium flex items-center gap-2 transition-all duration-300
            ${input.trim() && !isLoading
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Send className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-gray-400">
        {isListening ? (
          <span className="text-red-500 font-medium">Listening... speak now</span>
        ) : (
          <>Press Enter to send • Click mic to speak • Your digital twin responds based on uploaded documents</>
        )}
      </p>
    </form>
  );
}
