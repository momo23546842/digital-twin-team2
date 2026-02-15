"use client";

import { useState, useEffect, useRef } from 'react';
import { VoiceRecognition, VoiceSynthesis } from '@/lib/speech';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Phone, Mic, MicOff, Settings } from 'lucide-react';

interface PhoneCallModalProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<string>;
}

export default function PhoneCallModal({
  open,
  onClose,
  onSendMessage,
}: PhoneCallModalProps) {
  const [voiceRecognition] = useState(() => new VoiceRecognition());
  const [voiceSynthesis] = useState(() => new VoiceSynthesis());
  const [callState, setCallState] = useState<'connecting' | 'listening' | 'thinking' | 'speaking'>('connecting');
  const [transcript, setTranscript] = useState('');
  const [callActive, setCallActive] = useState(false);
  const callActiveRef = useRef(false);
  const [callDuration, setCallDuration] = useState(0);

  // Call duration timer
  useEffect(() => {
    if (callActive) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callActive]);

  // Start call when modal opens
  useEffect(() => {
    if (open && !callActive) {
      console.log('📞 Call opened, starting...');
      startCall();
    }

    return () => {
      if (callActive) {
        console.log('🔚 Component unmounting, ending call');
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Check microphone permission when modal opens
  useEffect(() => {
    if (open) {
      console.log('🎤 Checking microphone permissions...');
      if (navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => console.log('✅ Microphone access granted'))
          .catch((err) => console.error('❌ Microphone access denied:', err));
      } else {
        console.warn('getUserMedia not available in this environment');
      }
    }
  }, [open]);

  const cleanup = () => {
    try {
      voiceRecognition.stopListening();
    } catch (e) {}
    try {
      voiceSynthesis.stop();
    } catch (e) {}
    setCallActive(false);
    callActiveRef.current = false;
    setCallState('connecting');
    setTranscript('');
    setCallDuration(0);
  };

  const startCall = async () => {
    console.log('▶️ Starting call...');

    // Set callActive state and ref FIRST to avoid race conditions
    setCallActive(true);
    callActiveRef.current = true;

    // Small delay to allow React state to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    setCallState('speaking');

    const greeting = "Hello! How can I help you today?";

    voiceSynthesis.speak(greeting, {
      lang: 'en-US',
      rate: 1.1,
    });

    // Wait for greeting to finish, then start listening
    setTimeout(() => {
      console.log('⏭️ Greeting done, checking if call is active...');
      console.log('📊 callActive (ref):', callActiveRef.current);
      if (!callActiveRef.current) {
        console.log('⚠️ Call inactive after greeting; not starting listener');
        return;
      }
      startListening();
    }, 3500);
  };

  const startListening = () => {
    if (!callActiveRef.current) {
      console.log('⚠️ Call not active (ref check), skipping listen');
      return;
    }

    console.log('🎤 Starting to listen...');
    setCallState('listening');
    setTranscript('');

    voiceRecognition.startListening(
      async (text, isFinal) => {
        console.log(`📝 Transcript: "${text}" (final: ${isFinal})`);
        setTranscript(text);

        if (isFinal && text.trim().length > 0) {
          console.log('✅ Final transcript received');
          setCallState('thinking');

          try {
            console.log('🤔 Sending to AI...');
            const aiResponse = await onSendMessage(text);
            console.log('💬 AI response:', aiResponse);

            setCallState('speaking');
            voiceSynthesis.speak(aiResponse, {
              lang: 'en-US',
              rate: 1.1,
            });

            // Calculate speech duration
            const words = aiResponse.split(' ').length;
            const duration = Math.max((words / 2.5) * 1000, 2000);

            console.log(`⏱️ Waiting ${duration}ms for speech to complete`);

            setTimeout(() => {
              console.log('🔄 Restarting listener');
              startListening();
            }, duration);

          } catch (error) {
            console.error('❌ Error:', error);
            setTimeout(() => startListening(), 1000);
          }
        }
      },
      (error) => {
        console.error('🔴 Recognition error:', error);
        if (callActiveRef.current && error !== 'aborted') {
          setTimeout(() => startListening(), 1000);
        }
      }
    );
  };

  const endCall = () => {
    console.log('📴 Ending call...');
    callActiveRef.current = false;
    cleanup();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={endCall}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
        <DialogTitle className="sr-only">Voice Call</DialogTitle>

        <div className="flex flex-col items-center space-y-8 py-6">

          {/* Call Info */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Digital Twin
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {callState === 'connecting' && 'Connecting...'}
              {callState === 'listening' && 'Listening'}
              {callState === 'thinking' && 'Processing'}
              {callState === 'speaking' && 'Speaking'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {formatDuration(callDuration)}
            </p>
          </div>

          {/* Avatar with status indicator */}
          <div className="relative">
            <div className={`
              w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600
              flex items-center justify-center text-white text-5xl font-bold
              shadow-lg
              ${callState === 'listening' ? 'ring-4 ring-green-500 ring-offset-4 animate-pulse' : ''}
            `}>
              {callState === 'listening' && <Mic className="w-16 h-16" />}
              {callState === 'thinking' && (
                <Settings className="w-12 h-12 animate-spin" />
              )}
              {callState === 'speaking' && <MicOff className="w-16 h-16" />}
              {callState === 'connecting' && <Phone className="w-16 h-16" />}
            </div>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="w-full px-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  "{transcript}"
                </p>
              </div>
            </div>
          )}

          {/* Hang up button */}
          <Button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
            size="lg"
          >
            <Phone className="w-6 h-6 text-white transform rotate-135" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
