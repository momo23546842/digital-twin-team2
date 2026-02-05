"use client";

import { Mic, X } from "lucide-react";

interface VoiceOverlayProps {
  isActive: boolean;
  onClose: () => void;
}

export default function VoiceOverlay({ isActive, onClose }: VoiceOverlayProps) {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--primary)]/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
          aria-label="Close voice input"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Waveform visualization */}
        <div className="flex items-center gap-1 h-32 mb-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-[var(--accent)] rounded-full animate-waveform"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Mic icon with pulse */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[var(--accent)] rounded-full animate-ping opacity-30" />
          <div className="relative w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-xl shadow-[var(--accent)]/30">
            <Mic className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Status text */}
        <p className="text-white text-lg font-medium">Listening...</p>
        <p className="text-white/60 text-sm mt-2">Speak clearly into your microphone</p>
      </div>
    </div>
  );
}
