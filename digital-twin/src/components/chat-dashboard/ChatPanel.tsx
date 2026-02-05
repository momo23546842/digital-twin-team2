"use client";

import { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Send,
  Paperclip,
  Radio,
  ChevronDown,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Digital Twin System online. All sensors operational. How can I assist you with turbine monitoring today?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    role: "user",
    content: "Show me the current temperature readings for Turbine A3.",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    role: "ai",
    content: "Turbine A3 temperature readings:\n\n• Core Temperature: 847°C (optimal range)\n• Exhaust Gas: 523°C (normal)\n• Bearing Temperature: 72°C (within limits)\n\nAll thermal parameters are within operational thresholds. No anomalies detected.",
    timestamp: new Date(Date.now() - 180000),
  },
  {
    id: "4",
    role: "user",
    content: "What's the predicted maintenance window?",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "5",
    role: "ai",
    content: "Based on current performance metrics and wear patterns:\n\n• Next scheduled maintenance: 14 days\n• Predicted component lifespan: 2,847 hours remaining\n• Recommended inspection: Compressor blades (minor degradation detected)\n\nWould you like me to generate a detailed maintenance report?",
    timestamp: new Date(Date.now() - 60000),
  },
];

function AudioWaveform() {
  return (
    <div className="flex items-center gap-[3px] h-6 px-3">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-cyan-400 rounded-full waveform-bar"
          style={{
            animationDelay: `${i * 0.08}s`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Processing your request. Analyzing sensor data streams and correlating with historical patterns...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full glass-panel overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--background)] animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Active Conversation</h2>
              <p className="text-xs text-zinc-500">Turbine Control System A3</p>
            </div>
          </div>
        </div>

        {/* Live Audio Waveform */}
        <div className="flex items-center gap-3">
          {isVoiceActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-medium">Voice Active</span>
              <AudioWaveform />
            </div>
          )}
          <button className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[75%] px-4 py-3 rounded-2xl
                ${message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
              `}
            >
              <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
              <p className="text-[10px] text-zinc-500 mt-2">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          {/* Attachment Button */}
          <button className="p-3 rounded-xl text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300">
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message or command..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
            />
          </div>

          {/* Voice Input Button */}
          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`
              p-3 rounded-xl transition-all duration-300
              ${isVoiceActive 
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 glow-cyan" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            {isVoiceActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 transition-all duration-300 btn-glow"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
