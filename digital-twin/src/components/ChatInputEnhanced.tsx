'use client';

import React, { useState, useRef } from 'react';
import { Send, Loader } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  disabled,
  placeholder = 'Type your message... (Shift+Enter for new line)'
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-4">
      {/* Text Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 bg-slate-700 rounded-lg border border-slate-600 focus-within:border-emerald-500 transition-colors flex flex-col">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white placeholder-slate-400 p-3 focus:outline-none resize-none"
            rows={1}
            disabled={isLoading || disabled}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          {isLoading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
}
