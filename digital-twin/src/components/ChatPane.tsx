"use client";

import { motion } from "framer-motion";
import { Settings, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import Avatar from "@/components/Avatar";
import ChatInput from "@/components/ChatInput";
import DocumentUpload from "@/components/DocumentUpload";
import MessageList from "@/components/MessageList";
import SettingsDrawer, { 
  DEFAULT_SETTINGS, 
  loadPersonaSettings, 
  type PersonaSettings 
} from "@/components/SettingsDrawer";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { useVoice } from "@/hooks/useVoice";
import type { Message } from "@/types";

export default function ChatPane() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [personaSettings, setPersonaSettings] = useState<PersonaSettings>(DEFAULT_SETTINGS);
  const [sessionId, setSessionId] = useState<string>("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const { speak, stopSpeaking, isSpeaking } = useVoice({});

  const handleChunk = useCallback((chunk: string) => {
    setStreamingContent((prev) => prev + chunk);
  }, []);

  const handleComplete = useCallback((fullContent: string) => {
    const assistantMessage: Message = {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: fullContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setStreamingContent("");

    // Speak response if voice is enabled
    if (voiceEnabled && fullContent) {
      speak(fullContent);
    }
  }, [voiceEnabled, speak]);

  const { sendMessage, isStreaming } = useStreamingChat({
    onChunk: handleChunk,
    onComplete: handleComplete,
  });

  useEffect(() => {
    // Initialize session ID and load settings
    setSessionId(`session-${Date.now()}`);
    const savedSettings = loadPersonaSettings();
    setPersonaSettings(savedSettings);

    // Set initial welcome message
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hey there! 👋 I'm ${savedSettings.name}, your Digital Twin. Upload some documents about yourself - like a resume or bio - and I'll become YOU. Then people can chat with me and I'll respond just like you would. Pretty cool, right?`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setStreamingContent("");

    try {
      await sendMessage(content, messages, sessionId, personaSettings);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingContent("");
    }
  };

  const handleSettingsChange = (newSettings: PersonaSettings) => {
    setPersonaSettings(newSettings);
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Avatar
                name={personaSettings.name}
                isAssistant={true}
                isSpeaking={isSpeaking}
                isThinking={isStreaming}
                size="md"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {personaSettings.name}
                  <span className="text-sm font-normal text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
                    Your Digital Twin
                  </span>
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                  {isStreaming ? "Thinking..." : isSpeaking ? "Speaking..." : "Ready to chat"}
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="hidden sm:flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {/* Settings button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 transition-all"
                title="Open persona settings"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>

              {/* Voice toggle button */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full border transition-all
                  ${voiceEnabled 
                    ? 'bg-violet-100 border-violet-200 text-violet-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }
                  ${isSpeaking ? 'animate-pulse' : ''}
                `}
                title={voiceEnabled ? "Click to disable voice responses" : "Click to enable voice responses"}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="text-sm">{voiceEnabled ? "Voice On" : "Voice Off"}</span>
              </button>

              {/* Status indicator */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-violet-600">Online</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main chat container */}
      <div className="flex-1 flex flex-col relative z-10 p-4 sm:p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-gray-50 rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Messages */}
          <MessageList 
            messages={messages} 
            isLoading={isStreaming && !streamingContent}
            isStreaming={isStreaming && !!streamingContent}
            streamingContent={streamingContent}
            personaName={personaSettings.name}
          />

          {/* Bottom section inside bubble */}
          <div className="bg-white border-t border-gray-100">
            {/* Document Upload */}
            <DocumentUpload isLoading={isStreaming} />

            {/* Input */}
            <ChatInput onSubmit={handleSendMessage} isLoading={isStreaming} />
          </div>
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
        initialSettings={personaSettings}
      />
    </div>
  );
}
