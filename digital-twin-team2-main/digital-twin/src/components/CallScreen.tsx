'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, User } from 'lucide-react';

type CallStatus = 'calling' | 'connected' | 'ended';

interface CallScreenProps {
  isOpen: boolean;
  contactName?: string;
  contactAvatar?: string;
  onEndCall: () => void;
  onClose?: () => void;
}

export default function CallScreen({
  isOpen,
  contactName = 'Digital Twin',
  contactAvatar,
  onEndCall,
  onClose,
}: CallScreenProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>('calling');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // Reset state when call opens
  useEffect(() => {
    if (isOpen) {
      setCallStatus('calling');
      setSecondsElapsed(0);
      setIsMuted(false);
      setIsSpeakerOn(false);
    }
  }, [isOpen]);

  // Simulate connection after 2 seconds
  useEffect(() => {
    if (!isOpen || callStatus !== 'calling') return;

    const connectionTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);

    return () => clearTimeout(connectionTimer);
  }, [isOpen, callStatus]);

  // Timer effect when connected
  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle end call
  const handleEndCall = useCallback(() => {
    setCallStatus('ended');
    setTimeout(() => {
      onEndCall();
    }, 500);
  }, [onEndCall]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        callStatus === 'ended' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl" />
      
      {/* Animated background rings during calling */}
      {callStatus === 'calling' && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-80 h-80 rounded-full border border-emerald-500/10 animate-ping" style={{ animationDuration: '2.5s' }} />
          <div className="absolute w-96 h-96 rounded-full border border-emerald-500/5 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      )}

      {/* Main content - centered panel */}
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col px-6 pt-safe pb-safe">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-6 pb-4">
          {onClose && (
            <button
              onClick={handleEndCall}
              className="p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <div className="w-6 h-6">
                <X size={24} />
              </div>
            </button>
          )}
          <div className="flex-1 text-center">
            <span className="text-white/60 text-sm font-medium uppercase tracking-wider">
              {callStatus === 'calling' ? 'Calling' : callStatus === 'connected' ? 'Connected' : 'Call Ended'}
            </span>
          </div>
          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>

        {/* Center content - Avatar and info */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16">
          {/* Avatar with pulse animation */}
          <div className="relative mb-6">
            {/* Pulse rings during calling */}
            {callStatus === 'calling' && (
              <>
                <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                <span className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-pulse" />
                <span className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </>
            )}
            
            {/* Connected indicator ring */}
            {callStatus === 'connected' && (
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse opacity-50" />
            )}

            {/* Avatar circle */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              {contactAvatar ? (
                <img
                  src={contactAvatar}
                  alt={contactName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 text-white/90">
                  <User size={64} />
                </div>
              )}
            </div>
          </div>

          {/* Contact name */}
          <h2 className="text-3xl font-bold text-white mb-2">{contactName}</h2>

          {/* Status text */}
          <p className={`text-lg font-medium transition-colors ${
            callStatus === 'calling' 
              ? 'text-emerald-400 animate-pulse' 
              : callStatus === 'connected'
                ? 'text-white/70'
                : 'text-slate-400'
          }`}>
            {callStatus === 'calling' && 'Ringing...'}
            {callStatus === 'connected' && formatTime(secondsElapsed)}
            {callStatus === 'ended' && 'Call Ended'}
          </p>

          {/* Connection quality indicator (optional visual) */}
          {callStatus === 'connected' && (
            <div className="flex items-center gap-1 mt-3">
              <div className="w-1 h-2 bg-emerald-500 rounded-full" />
              <div className="w-1 h-3 bg-emerald-500 rounded-full" />
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <div className="w-1 h-3 bg-emerald-500/50 rounded-full" />
              <span className="text-xs text-white/50 ml-2">Good connection</span>
            </div>
          )}
        </div>

        {/* Bottom action buttons */}
        <div className="pb-12 pt-8">
          {/* Main action buttons */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex flex-col items-center gap-2 transition-all ${
                isMuted ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isMuted 
                  ? 'bg-white text-slate-900' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}>
                {isMuted ? (
                  <div className="w-7 h-7">
                    <MicOff size={28} />
                  </div>
                ) : (
                  <div className="w-7 h-7">
                    <Mic size={28} />
                  </div>
                )}
              </div>
              <span className="text-xs text-white/70 font-medium">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </button>

            {/* Speaker button */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`flex flex-col items-center gap-2 transition-all ${
                isSpeakerOn ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isSpeakerOn 
                  ? 'bg-white text-slate-900' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}>
                {isSpeakerOn ? (
                  <div className="w-7 h-7">
                    <Volume2 size={28} />
                  </div>
                ) : (
                  <div className="w-7 h-7">
                    <VolumeX size={28} />
                  </div>
                )}
              </div>
              <span className="text-xs text-white/70 font-medium">
                {isSpeakerOn ? 'Speaker' : 'Speaker'}
              </span>
            </button>
          </div>

          {/* End Call button */}
          <div className="flex justify-center">
            <button
              onClick={handleEndCall}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/40">
                <div className="w-9 h-9 text-white transform rotate-135">
                  <PhoneOff size={36} />
                </div>
              </div>
              <span className="text-xs text-white/70 font-medium group-hover:text-white transition-colors">
                End Call
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
