'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
  Settings2,
  X,
  Bug,
  Phone,
  PhoneOff,
} from 'lucide-react';
import { useVoiceRecognition, VoiceRecognitionStatus } from '@/hooks/useVoiceRecognition';
import { useSpeechSynthesis, SpeechSynthesisStatus } from '@/hooks/useSpeechSynthesis';

// Debug logging helper
const debug = (emoji: string, message: string, ...args: any[]) => {
  console.log(`${emoji} [VoiceChat] ${message}`, ...args);
};

export interface VoiceChatProps {
  onTranscript: (text: string, inputMethod: 'voice') => void;
  textToSpeak?: string;
  isEnabled?: boolean;
  autoSpeak?: boolean;
  onAutoSpeakChange?: (enabled: boolean) => void;
  language?: string;
  className?: string;
}

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  language: 'en-US',
};

export function VoiceChat({
  onTranscript,
  textToSpeak,
  isEnabled = true,
  autoSpeak = true,
  onAutoSpeakChange,
  language = 'en-US',
  className = '',
}: VoiceChatProps) {
  const [localAutoSpeak, setLocalAutoSpeak] = useState<boolean>(autoSpeak);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [settings, setSettings] = useState<VoiceSettings>({
    ...DEFAULT_SETTINGS,
    language,
  });
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  
  // Call mode state - for continuous conversation
  const [callMode, setCallMode] = useState<boolean>(false);
  const callModeRef = useRef<boolean>(false);
  const shouldRestartMic = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  
  // Mic level monitoring
  const [micLevel, setMicLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Use ref to always have the latest onTranscript callback
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Stable callback that uses the ref
  const handleFinalTranscript = useCallback((text: string) => {
    debug('📤', `Sending final transcript to parent: "${text}"`);
    onTranscriptRef.current(text, 'voice');
  }, []);

  // Keep callMode ref in sync
  useEffect(() => {
    callModeRef.current = callMode;
  }, [callMode]);

  // Log component mount
  useEffect(() => {
    debug('🎤', 'VoiceChat component mounted');
    debug('🔍', 'Checking browser support...');
    
    // Check browser APIs
    const hasSpeechRecognition = !!(
      typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
    const hasSpeechSynthesis = !!(
      typeof window !== 'undefined' && 
      window.speechSynthesis
    );
    
    debug(hasSpeechRecognition ? '✅' : '❌', `SpeechRecognition: ${hasSpeechRecognition ? 'Available' : 'Not Available'}`);
    debug(hasSpeechSynthesis ? '✅' : '❌', `SpeechSynthesis: ${hasSpeechSynthesis ? 'Available' : 'Not Available'}`);
    
    return () => {
      debug('🧹', 'VoiceChat component unmounting');
    };
  }, []);

  // Voice recognition hook - continuous in call mode
  const {
    isSupported: isRecognitionSupported,
    isListening,
    status: recognitionStatus,
    transcript,
    interimTranscript,
    error: recognitionError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    lang: settings.language,
    continuous: callMode, // Continuous in call mode
    interimResults: true,
    onTranscript: (text, isFinal) => {
      debug('🎙️', `Transcript received: "${text}" (final: ${isFinal}, callMode: ${callModeRef.current})`);
      if (isFinal && text.trim()) {
        debug('📤', `AUTO-SENDING final transcript: "${text.trim()}"`);
        handleFinalTranscript(text.trim());
        // In call mode, we'll restart after AI finishes speaking
        if (callModeRef.current) {
          shouldRestartMic.current = true;
        }
      }
    },
    onEnd: () => {
      // Auto-restart in call mode if not currently speaking
      debug('🔄', `Recognition ended. callMode: ${callModeRef.current}, isSpeaking: ${isSpeakingRef.current}`);
      if (callModeRef.current && !isSpeakingRef.current) {
        debug('🎤', 'Call mode: auto-restarting mic after recognition ended');
        setTimeout(() => {
          if (callModeRef.current && !isSpeakingRef.current) {
            resetTranscript();
            startListening();
          }
        }, 500);
      }
    },
  });

  // Speech synthesis hook
  const {
    isSupported: isSynthesisSupported,
    isSpeaking,
    status: synthesisStatus,
    voices,
    currentVoice,
    error: synthesisError,
    speak,
    cancel: cancelSpeech,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  } = useSpeechSynthesis({
    lang: settings.language,
    rate: settings.rate,
    pitch: settings.pitch,
    volume: settings.volume,
  });

  // Keep isSpeakingRef in sync
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Start mic level monitoring
  const startMicMonitoring = useCallback(async () => {
    try {
      debug('🎤', 'Starting microphone level monitoring...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      debug('✅', 'Microphone stream obtained');
      debug('🔊', 'Audio tracks:', stream.getAudioTracks().map(t => t.label));
      
      micStreamRef.current = stream;

      // Create audio context to visualize levels
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Visualize mic levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setMicLevel(Math.min(100, average * 1.5)); // Amplify for visibility
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
      
    } catch (err) {
      debug('❌', 'Microphone access failed:', err);
      throw err;
    }
  }, []);

  // Stop mic level monitoring
  const stopMicMonitoring = useCallback(() => {
    debug('🛑', 'Stopping microphone level monitoring');
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        debug('🔇', 'Stopping track:', track.label);
        track.stop();
      });
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setMicLevel(0);
  }, []);

  // Start/stop mic monitoring when listening state changes
  useEffect(() => {
    if (isListening) {
      startMicMonitoring().catch(err => {
        debug('❌', 'Failed to start mic monitoring:', err);
      });
    } else {
      stopMicMonitoring();
    }
    
    return () => {
      stopMicMonitoring();
    };
  }, [isListening, startMicMonitoring, stopMicMonitoring]);

  // Auto-speak when textToSpeak changes
  useEffect(() => {
    if (
      textToSpeak &&
      localAutoSpeak &&
      isSynthesisSupported &&
      textToSpeak !== lastSpokenText
    ) {
      // In call mode, stop listening while AI speaks
      if (callMode && isListening) {
        debug('🔇', 'Call mode: pausing mic while AI speaks');
        stopListening();
        shouldRestartMic.current = true;
      }
      speak(textToSpeak);
      setLastSpokenText(textToSpeak);
    }
  }, [textToSpeak, localAutoSpeak, isSynthesisSupported, speak, lastSpokenText, callMode, isListening, stopListening]);

  // Auto-restart mic after AI finishes speaking (in call mode)
  useEffect(() => {
    if (callMode && !isSpeaking && shouldRestartMic.current) {
      debug('🎤', 'Call mode: AI finished speaking, restarting mic');
      shouldRestartMic.current = false;
      // Small delay to let speech synthesis fully complete
      const timer = setTimeout(() => {
        if (callModeRef.current && !isListening) {
          resetTranscript();
          startListening();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, callMode, isListening, startListening, resetTranscript]);

  // Update settings when controls change
  useEffect(() => {
    setRate(settings.rate);
    setPitch(settings.pitch);
    setVolume(settings.volume);
  }, [settings.rate, settings.pitch, settings.volume, setRate, setPitch, setVolume]);

  // Toggle listening
  const handleToggleListening = useCallback(() => {
    debug('🔴', `Toggle listening: currently ${isListening ? 'listening' : 'not listening'}`);
    if (isListening) {
      // When stopping, if there's an unsent transcript, send it
      if (transcript.trim()) {
        debug('📤', `Sending accumulated transcript before stopping: "${transcript.trim()}"`);
        handleFinalTranscript(transcript.trim());
        resetTranscript();
      }
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript, transcript, handleFinalTranscript]);

  // Start call mode - continuous conversation
  const handleStartCall = useCallback(() => {
    debug('📞', 'Starting call mode');
    setCallMode(true);
    callModeRef.current = true;
    setLocalAutoSpeak(true);
    onAutoSpeakChange?.(true);
    resetTranscript();
    startListening();
  }, [startListening, resetTranscript, onAutoSpeakChange]);

  // End call mode
  const handleEndCall = useCallback(() => {
    debug('📵', 'Ending call mode');
    setCallMode(false);
    callModeRef.current = false;
    shouldRestartMic.current = false;
    if (isListening) {
      if (transcript.trim()) {
        handleFinalTranscript(transcript.trim());
      }
      stopListening();
    }
    resetTranscript();
    cancelSpeech();
  }, [isListening, stopListening, resetTranscript, cancelSpeech, transcript, handleFinalTranscript]);

  // Toggle auto-speak
  const handleToggleAutoSpeak = useCallback(() => {
    const newValue = !localAutoSpeak;
    debug('🔊', `Toggle auto-speak: ${newValue ? 'ON' : 'OFF'}`);
    setLocalAutoSpeak(newValue);
    onAutoSpeakChange?.(newValue);
    if (!newValue && isSpeaking) {
      cancelSpeech();
    }
  }, [localAutoSpeak, onAutoSpeakChange, isSpeaking, cancelSpeech]);

  // Test speech synthesis
  const handleTestSpeak = useCallback(() => {
    const testText = 'Hello! This is a test of the speech synthesis system. Can you hear me?';
    debug('🔊', `Testing speech synthesis: "${testText}"`);
    speak(testText);
  }, [speak]);

  // Test microphone audio capture only (no speech recognition)
  const handleTestMicOnly = useCallback(async () => {
    debug('🎤', 'Testing microphone audio capture...');
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      debug('✅', 'Microphone permission granted!');
      
      const tracks = stream.getAudioTracks();
      debug('🔊', `Audio tracks: ${tracks.length}`);
      tracks.forEach((track, i) => {
        debug('🔊', `Track ${i}: ${track.label} (enabled: ${track.enabled}, muted: ${track.muted})`);
      });
      
      // Create audio context to measure levels
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      debug('🎤', 'Monitoring mic level for 5 seconds... SPEAK NOW!');
      
      let maxLevel = 0;
      const startTime = Date.now();
      
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const level = Math.min(100, average * 1.5);
        
        if (level > maxLevel) {
          maxLevel = level;
          debug('📊', `New max level: ${maxLevel.toFixed(0)}%`);
        }
        
        if (Date.now() - startTime < 5000) {
          requestAnimationFrame(checkLevel);
        } else {
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          
          if (maxLevel > 20) {
            debug('✅', `Microphone working! Max level: ${maxLevel.toFixed(0)}%`);
            alert(`✅ Microphone is working!\n\nMax level detected: ${maxLevel.toFixed(0)}%\n\nNow try the speech recognition.`);
          } else if (maxLevel > 5) {
            debug('⚠️', `Low mic level: ${maxLevel.toFixed(0)}% - speak louder!`);
            alert(`⚠️ Low microphone level: ${maxLevel.toFixed(0)}%\n\nTry speaking louder or check your microphone settings.`);
          } else {
            debug('❌', `No audio detected! Max level: ${maxLevel.toFixed(0)}%`);
            alert(`❌ No audio detected!\n\nPlease check:\n1. Microphone is not muted\n2. Correct microphone is selected\n3. Microphone works in other apps`);
          }
        }
      };
      
      checkLevel();
      
    } catch (err) {
      debug('❌', 'Microphone test failed:', err);
      alert(`❌ Microphone access failed!\n\n${(err as Error).message}\n\nPlease allow microphone access and try again.`);
    }
  }, []);

  // Send transcript manually
  const handleSendTranscript = useCallback(() => {
    if (transcript.trim()) {
      debug('📤', `Manually sending transcript: "${transcript.trim()}"`);
      handleFinalTranscript(transcript.trim());
      resetTranscript();
      stopListening();
    }
  }, [transcript, handleFinalTranscript, resetTranscript, stopListening]);

  // Render debug panel
  const renderDebugPanel = () => {
    if (!showDebug) return null;

    return (
      <div className="mt-4 p-4 bg-slate-900 border border-slate-600 rounded-lg text-xs font-mono">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white font-bold">Debug Info</h4>
          <button
            onClick={() => setShowDebug(false)}
            className="text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-2 text-slate-300">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <span className="text-slate-500">Call Mode:</span>
              <span className={callMode ? 'text-green-400 font-bold' : 'text-slate-400'}>
                {' '}{callMode ? '📞 ACTIVE' : 'Off'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Recognition Supported:</span>
              <span className={isRecognitionSupported ? 'text-green-400' : 'text-red-400'}>
                {' '}{isRecognitionSupported ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Synthesis Supported:</span>
              <span className={isSynthesisSupported ? 'text-green-400' : 'text-red-400'}>
                {' '}{isSynthesisSupported ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Recognition Status:</span>
              <span className="text-blue-400"> {recognitionStatus}</span>
            </div>
            <div>
              <span className="text-slate-500">Synthesis Status:</span>
              <span className="text-blue-400"> {synthesisStatus}</span>
            </div>
            <div>
              <span className="text-slate-500">Is Listening:</span>
              <span className={isListening ? 'text-green-400' : 'text-slate-400'}>
                {' '}{isListening ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Is Speaking:</span>
              <span className={isSpeaking ? 'text-green-400' : 'text-slate-400'}>
                {' '}{isSpeaking ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Language:</span>
              <span className="text-yellow-400"> {settings.language}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Current Voice:</span>
              <span className="text-yellow-400"> {currentVoice?.name || 'None'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Available Voices:</span>
              <span className="text-yellow-400"> {voices.length}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Mic Level:</span>
              <span className={micLevel > 20 ? 'text-green-400' : 'text-red-400'}>
                {' '}{micLevel.toFixed(0)}%
              </span>
              {isListening && micLevel < 5 && (
                <span className="text-yellow-400 ml-2">⚠️ Too low!</span>
              )}
            </div>
          </div>

          {(recognitionError || synthesisError) && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded">
              <span className="text-red-400 font-bold">Error: </span>
              <span className="text-red-300">
                {recognitionError?.message || synthesisError?.message}
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleTestSpeak}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
            >
              🔊 Test Speaker
            </button>
            <button
              onClick={handleTestMicOnly}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
            >
              🎤 Test Mic Only
            </button>
            <button
              onClick={handleToggleListening}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              {isListening ? '⏹️ Stop' : '🗣️ Test Recognition'}
            </button>
          </div>

          <p className="text-slate-500 mt-2">
            1. Click "🎤 Test Mic Only" first to verify mic works<br/>
            2. If mic works, click "🗣️ Test Recognition" and speak<br/>
            3. Check console (F12) for detailed logs
          </p>
        </div>
      </div>
    );
  };

  // Get status display text
  const getStatusText = (): string => {
    if (!isRecognitionSupported && !isSynthesisSupported) {
      return 'Voice not available';
    }
    if (callMode) {
      if (synthesisStatus === 'speaking') {
        return 'AI is speaking...';
      }
      if (recognitionStatus === 'listening') {
        return 'Listening to you...';
      }
      return 'Call active';
    }
    if (recognitionStatus === 'listening') {
      return 'Listening...';
    }
    if (recognitionStatus === 'processing') {
      return 'Processing...';
    }
    if (synthesisStatus === 'speaking') {
      return 'Speaking...';
    }
    if (recognitionError || synthesisError) {
      return 'Error';
    }
    return 'Ready';
  };

  // Get status color class
  const getStatusColor = (): string => {
    if (callMode) return 'text-green-400';
    if (recognitionStatus === 'listening') return 'text-red-400';
    if (synthesisStatus === 'speaking') return 'text-blue-400';
    if (recognitionError || synthesisError) return 'text-yellow-400';
    return 'text-slate-400';
  };

  // Render error message
  const renderError = () => {
    const error = recognitionError || synthesisError;
    if (!error) return null;

    debug('❌', `Displaying error: ${error.code} - ${error.message}`);

    return (
      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm mb-3">
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-200 font-medium">{error.message}</p>
          <p className="text-red-400/70 text-xs mt-1">Error code: {error.code}</p>
        </div>
      </div>
    );
  };

  // Render voice settings panel
  const renderSettings = () => {
    if (!showSettings) return null;

    const langPrefix = settings.language.split('-')[0];
    const availableVoices = voices.filter((v) => v.lang.startsWith(langPrefix));

    return (
      <div className="absolute bottom-full right-0 mb-2 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 z-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-white">Voice Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Language */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">Language</label>
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings((s) => ({ ...s, language: e.target.value }))
            }
            className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="ja-JP">Japanese</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="ko-KR">Korean</option>
          </select>
        </div>

        {/* Voice selection */}
        {availableVoices.length > 0 && (
          <div className="mb-4">
            <label className="text-xs text-slate-400 block mb-1">Voice</label>
            <select
              value={currentVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) setVoice(voice);
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rate */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">
            Speed: {settings.rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.rate}
            onChange={(e) =>
              setSettings((s) => ({ ...s, rate: parseFloat(e.target.value) }))
            }
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Pitch */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">
            Pitch: {settings.pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={settings.pitch}
            onChange={(e) =>
              setSettings((s) => ({ ...s, pitch: parseFloat(e.target.value) }))
            }
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Volume */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Volume: {Math.round(settings.volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.volume}
            onChange={(e) =>
              setSettings((s) => ({ ...s, volume: parseFloat(e.target.value) }))
            }
            className="w-full accent-emerald-500"
          />
        </div>
      </div>
    );
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Error display */}
      {renderError()}

      {/* Transcript display (when listening) */}
      {(isListening || transcript) && (
        <div className="mb-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase">
              Voice Input
            </span>
            {isListening && (
              <div className="flex items-center gap-3">
                {/* Mic Level Indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Mic:</span>
                  <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-75 ${
                        micLevel > 50 ? 'bg-green-500' : micLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400">Recording</span>
                </div>
              </div>
            )}
          </div>

          <p className="text-white text-sm min-h-[1.5rem]">
            {transcript}
            {interimTranscript && (
              <span className="text-slate-400 italic">{interimTranscript}</span>
            )}
            {!transcript && !interimTranscript && isListening && (
              <span className="text-slate-500">Speak now...</span>
            )}
          </p>

          {/* Mic level warning */}
          {isListening && micLevel < 5 && (
            <p className="mt-2 text-xs text-yellow-400">
              ⚠️ Low mic level - speak louder or check microphone
            </p>
          )}

          {transcript && !isListening && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSendTranscript}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
              >
                Send
              </button>
              <button
                onClick={resetTranscript}
                className="bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Voice controls */}
      <div className="flex items-center gap-2">
        {/* Call Mode Button - Main action for call-like experience */}
        <button
          onClick={callMode ? handleEndCall : handleStartCall}
          disabled={!isRecognitionSupported || !isSynthesisSupported}
          title={callMode ? 'End call' : 'Start voice call'}
          className={`
            relative p-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
            ${
              callMode
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {callMode ? (
            <>
              <PhoneOff size={20} />
              <span className="text-sm font-medium">End Call</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-300 rounded-full animate-pulse" />
            </>
          ) : (
            <>
              <Phone size={20} />
              <span className="text-sm font-medium">Start Call</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-600" />

        {/* Microphone button - for single message */}
        <button
          onClick={handleToggleListening}
          disabled={!isRecognitionSupported || callMode}
          title={callMode ? 'Using call mode' : isListening ? 'Stop recording' : 'Record one message'}
          className={`
            relative p-3 rounded-lg font-medium transition-all flex items-center justify-center
            ${
              isListening
                ? 'bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30'
                : 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isListening ? (
            <>
              <MicOff size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </>
          ) : (
            <Mic size={20} />
          )}
        </button>

        {/* Auto-speak toggle */}
        <button
          onClick={handleToggleAutoSpeak}
          disabled={!isSynthesisSupported}
          title={localAutoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
          className={`
            p-3 rounded-lg font-medium transition-all flex items-center justify-center
            ${
              localAutoSpeak
                ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400 hover:bg-blue-500/30'
                : 'bg-slate-600/50 border-2 border-slate-500 text-slate-400 hover:bg-slate-600'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isSpeaking ? (
            <Loader2 size={20} className="animate-spin" />
          ) : localAutoSpeak ? (
            <Volume2 size={20} />
          ) : (
            <VolumeX size={20} />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Voice settings"
          className={`
            p-3 rounded-lg transition-all flex items-center justify-center
            ${
              showSettings
                ? 'bg-slate-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600'
            }
          `}
        >
          <Settings2 size={20} />
        </button>

        {/* Status indicator */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className={`text-xs ${getStatusColor()}`}>{getStatusText()}</span>
          {(recognitionStatus === 'listening' || synthesisStatus === 'speaking') && (
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-4 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-5 bg-current rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              <span className="w-1 h-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
            </div>
          )}
        </div>

        {/* Settings panel */}
        {renderSettings()}
      </div>

      {/* Help text and debug toggle */}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {callMode 
            ? '📞 Call active - speak naturally, AI will respond and listen again'
            : '📞 Start Call for conversation • 🎤 Mic for single message'
          }
        </p>
        <button
          onClick={() => setShowDebug(!showDebug)}
          title="Toggle debug panel"
          className={`p-1 rounded transition-colors ${
            showDebug 
              ? 'text-yellow-400 bg-yellow-500/20' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bug size={14} />
        </button>
      </div>

      {/* Debug panel */}
      {renderDebugPanel()}
    </div>
  );
}

export default VoiceChat;
