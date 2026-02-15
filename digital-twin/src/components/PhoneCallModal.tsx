"use client";

import { useState, useEffect } from 'react';
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
  }, [open]);

  const cleanup = () => {
    voiceRecognition.stopListening();
    voiceSynthesis.stop();
    setCallActive(false);
    setCallState('connecting');
    setTranscript('');
    setCallDuration(0);
  };

  const startCall = async () => {
    console.log('▶️ Starting call...');
    setCallActive(true);
    setCallState('speaking');
    
    const greeting = "Hello! How can I help you today?";
    
    voiceSynthesis.speak(greeting, {
      lang: 'en-US',
      rate: 1.1,
    });

    // Wait for greeting to finish, then start listening
    setTimeout(() => {
      console.log('⏭️ Greeting done, starting listener');
      startListening();
    }, 3500);
  };

  const startListening = () => {
    if (!callActive) {
      console.log('⚠️ Call not active, skipping listen');
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
        if (callActive && error !== 'aborted') {
          setTimeout(() => startListening(), 1000);
        }
      }
    );
  };

  const endCall = () => {
    console.log('📴 Ending call...');
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
"use client";

import { useState, useEffect } from 'react';
import { VoiceRecognition, VoiceSynthesis } from '@/lib/speech';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
  const [callState, setCallState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [callActive, setCallActive] = useState(false);

  // Start call when modal opens
  useEffect(() => {
    if (open && !callActive) {
      startCall();
    }
    
    // Cleanup on unmount
    return () => {
      if (callActive) {
        endCall();
      }
    };
  }, [open]);

  const startCall = () => {
    console.log('📞 Starting call...');
    setCallActive(true);
    setCallState('speaking');
    
    // Initial greeting
    const greeting = "Hello! I'm your Digital Twin. How can I help you today?";
    
    voiceSynthesis.speak(greeting, {
      lang: 'en-US',
      rate: 1.1,
      pitch: 1.0,
    });

    // After greeting, start listening
    setTimeout(() => {
      if (callActive) {
        startListening();
      }
    }, 4000); // Wait 4 seconds for greeting
  };

  const startListening = () => {
    console.log('🎤 Starting to listen...');
    setCallState('listening');
    setTranscript('');
    
    voiceRecognition.startListening(
      async (text, isFinal) => {
        console.log('Transcript:', text, 'Final:', isFinal);
        setTranscript(text);
        
        if (isFinal && text.trim().length > 0) {
          console.log('✓ Final transcript:', text);
          // User finished speaking
          setCallState('thinking');
          
          try {
            // Send to AI and get response
            console.log('🤔 Getting AI response...');
            const aiResponse = await onSendMessage(text);
            console.log('✓ AI response received:', aiResponse);
            
            // Speak AI response
            setCallState('speaking');
            voiceSynthesis.speak(aiResponse, {
              lang: 'en-US',
              rate: 1.1,
              pitch: 1.0,
            });
            
            // Estimate speech duration and restart listening
            const words = aiResponse.split(' ').length;
            const estimatedDuration = Math.max((words / 2.5) * 1000, 2000);
            
            console.log(`🗣️ Speaking for ~${estimatedDuration}ms`);
            
            setTimeout(() => {
              if (callActive) {
                console.log('🔄 Restarting listening...');
                startListening();
              }
            }, estimatedDuration);
            
          } catch (error) {
            console.error('❌ Error processing voice:', error);
            setCallState('listening');
            // Retry listening after error
            setTimeout(() => {
              if (callActive) {
                startListening();
              }
            }, 1000);
          }
        }
      },
      (error) => {
        console.error('❌ Voice recognition error:', error);
        // Retry listening on error
        if (callActive && error !== 'aborted') {
          setTimeout(() => {
            if (callActive) {
              startListening();
            }
          }, 1000);
        }
      }
    );
  };

  const endCall = () => {
    console.log('📞 Ending call...');
    setCallActive(false);
    voiceRecognition.stopListening();
    voiceSynthesis.stop();
    setCallState('idle');
    setTranscript('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={endCall}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Phone Call</DialogTitle>
        
        {/* WhatsApp-style simple design */}
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          
          {/* Status Text */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">
              {callState === 'idle' && '📞 Call Starting...'}
              {callState === 'listening' && '🎤 Listening...'}
              {callState === 'thinking' && '💭 Thinking...'}
              {callState === 'speaking' && '🗣️ Speaking...'}
            </h2>
          </div>

          {/* Large animated circle indicator */}
          <div className={`
            relative w-40 h-40 rounded-full flex items-center justify-center
            transition-all duration-300 text-6xl
            ${callState === 'listening' ? 'bg-green-500/20 ring-8 ring-green-500/30 animate-pulse' : ''}
            ${callState === 'thinking' ? 'bg-yellow-500/20 ring-8 ring-yellow-500/30' : ''}
            ${callState === 'speaking' ? 'bg-blue-500/20 ring-8 ring-blue-500/30 animate-pulse' : ''}
            ${callState === 'idle' ? 'bg-gray-500/20' : ''}
          `}>
            {callState === 'listening' && '🎤'}
            {callState === 'thinking' && '💭'}
            {callState === 'speaking' && '🗣️'}
            {callState === 'idle' && '📞'}
          </div>

          {/* Transcript bubble */}
          {transcript && (
            <div className="w-full px-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {transcript}
                </p>
              </div>
            </div>
          )}

          {/* Large red hang-up button */}
          <Button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl"
          >
            📞
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
