'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Send, Mic, MicOff, Loader, Eye, EyeOff, AlertCircle, Phone } from 'lucide-react';
import type { Message, Conversation } from '@/types';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  onStartCall?: () => void;
  isInCall?: boolean;
}

export default function ChatInput({ onSendMessage, isLoading, disabled, onStartCall, isInCall }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => (prev ? prev + ' ' : '') + trans);
          } else {
            interimTranscript += trans;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const handleStartVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const handleStopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendVoiceTranscript = () => {
    if (transcript.trim()) {
      onSendMessage(transcript);
      setTranscript('');
      setShowTranscript(false);
    }
  };

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
    <div className="bg-slate-800 border-t border-slate-700 p-4 space-y-3">
      {/* Voice Transcript Display */}
      {showTranscript && (
        <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-medium text-slate-300">VOICE TRANSCRIPT</p>
            <button
              onClick={() => setShowTranscript(false)}
              className="text-slate-400 hover:text-slate-300"
            >
              <EyeOff size={16} />
            </button>
          </div>
          <p className="text-slate-200 mb-3">{transcript || 'Listening...'}</p>
          {transcript && (
            <button
              onClick={handleSendVoiceTranscript}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded font-medium transition-colors"
            >
              Send Voice Message
            </button>
          )}
        </div>
      )}

      {/* Text Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 bg-slate-700 rounded-lg border border-slate-600 focus-within:border-emerald-500 transition-colors flex flex-col">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 bg-transparent text-white placeholder-slate-400 p-3 focus:outline-none resize-none"
            rows={1}
            disabled={isLoading || disabled}
          />
        </div>

        <div className="flex gap-2">
          {/* Call Button */}
          <button
            onClick={onStartCall}
            disabled={isLoading || disabled || isInCall}
            className={`p-3 rounded-full font-medium transition-all flex items-center justify-center ${
              isInCall
                ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isInCall ? 'In Call' : 'Start Call'}
          >
            <Phone size={20} />
          </button>

          {/* Voice Button */}
          <button
            onClick={isRecording ? handleStopVoice : handleStartVoice}
            disabled={isLoading || disabled}
            className={`p-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isRecording
                ? 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30'
                : 'bg-emerald-500/20 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

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
      </div>

      {/* Voice Status */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Recording... Click the microphone to stop
        </div>
      )}

      {transcript && !showTranscript && (
        <button
          onClick={() => setShowTranscript(true)}
          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <Eye size={16} />
          View transcript
        </button>
      )}

      <p className="text-xs text-slate-400">
        💡 Tip: Use voice for quick questions, or type for detailed conversations
      </p>
    </div>
  );
}
