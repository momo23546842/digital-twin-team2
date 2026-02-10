'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Debug logging helper
const debug = (emoji: string, message: string, ...args: any[]) => {
  console.log(`${emoji} [SpeechSynthesis] ${message}`, ...args);
};

export type SpeechSynthesisStatus = 
  | 'idle' 
  | 'speaking' 
  | 'paused' 
  | 'error' 
  | 'unsupported';

export interface SpeechSynthesisError {
  code: string;
  message: string;
  messageJa: string;
}

export interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
  voiceName?: string; // Preferred voice name
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisError) => void;
  onStatusChange?: (status: SpeechSynthesisStatus) => void;
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  status: SpeechSynthesisStatus;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  error: SpeechSynthesisError | null;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

const ERROR_MESSAGES: Record<string, SpeechSynthesisError> = {
  'unsupported': {
    code: 'unsupported',
    message: 'Your browser does not support speech synthesis.',
    messageJa: 'お使いのブラウザは音声合成に対応していません。',
  },
  'no-voice': {
    code: 'no-voice',
    message: 'No voice available for the selected language.',
    messageJa: '選択した言語で利用可能な音声がありません。',
  },
  'synthesis-failed': {
    code: 'synthesis-failed',
    message: 'Speech synthesis failed. Please try again.',
    messageJa: '音声合成に失敗しました。もう一度お試しください。',
  },
  'canceled': {
    code: 'canceled',
    message: 'Speech was canceled.',
    messageJa: '音声が中止されました。',
  },
  'unknown': {
    code: 'unknown',
    message: 'An unknown error occurred during speech synthesis.',
    messageJa: '音声合成中に不明なエラーが発生しました。',
  },
};

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const {
    lang = 'ja-JP',
    rate: initialRate = 1,
    pitch: initialPitch = 1,
    volume: initialVolume = 1,
    voiceName,
    onStart,
    onEnd,
    onError,
    onStatusChange,
  } = options;

  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [status, setStatus] = useState<SpeechSynthesisStatus>('idle');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [error, setError] = useState<SpeechSynthesisError | null>(null);
  const [rate, setRateState] = useState<number>(initialRate);
  const [pitch, setPitchState] = useState<number>(initialPitch);
  const [volume, setVolumeState] = useState<number>(initialVolume);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support and get voices
  useEffect(() => {
    debug('🔍', 'Checking browser support...');
    
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      debug('❌', 'Speech Synthesis not supported');
      setIsSupported(false);
      setStatus('unsupported');
      const unsupportedError = ERROR_MESSAGES['unsupported'];
      setError(unsupportedError);
      onError?.(unsupportedError);
      return;
    }

    debug('✅', 'Speech Synthesis API available');
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setIsSupported(true);

    // Load voices
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      debug('🗣️', `Loaded ${availableVoices.length} voices`);
      setVoices(availableVoices);

      // Find a suitable voice for the language
      const langPrefix = lang.split('-')[0];
      const matchingVoices = availableVoices.filter((v) =>
        v.lang.startsWith(langPrefix)
      );
      debug('🔍', `Found ${matchingVoices.length} voices for language prefix: ${langPrefix}`);
      
      // Try to find preferred voice by name or use first matching voice
      let selectedVoice: SpeechSynthesisVoice | null = null;

      if (voiceName) {
        selectedVoice = availableVoices.find((v) =>
          v.name.toLowerCase().includes(voiceName.toLowerCase())
        ) || null;
      }

      if (!selectedVoice && matchingVoices.length > 0) {
        // Prefer native voices (usually higher quality)
        selectedVoice =
          matchingVoices.find((v) => v.localService) ||
          matchingVoices[0];
      }

      // Final fallback: use first available voice
      if (!selectedVoice && availableVoices.length > 0) {
        selectedVoice = availableVoices[0];
      }

      if (selectedVoice) {
        debug('✅', `Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        setCurrentVoice(selectedVoice);
      } else {
        debug('⚠️', 'No suitable voice found');
      }
    };

    // Voices may load asynchronously in some browsers
    loadVoices();
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
      synth.cancel();
    };
  }, [lang, voiceName, onError]);

  // Update status and notify
  const updateStatus = useCallback(
    (newStatus: SpeechSynthesisStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

  // Handle error
  const handleError = useCallback(
    (errorCode: string) => {
      const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['unknown'];
      setError(errorInfo);
      updateStatus('error');
      onError?.(errorInfo);
    },
    [onError, updateStatus]
  );

  // Speak text
  const speak = useCallback(
    (text: string) => {
      debug('🔊', `Speak requested: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
      const synth = synthRef.current;
      if (!synth || !isSupported) {
        debug('❌', 'Synthesis not supported or not initialized');
        handleError('unsupported');
        return;
      }

      if (!text.trim()) {
        debug('⚠️', 'Empty text, ignoring');
        return;
      }

      // Cancel any ongoing speech
      debug('🛑', 'Canceling any ongoing speech');
      synth.cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Set properties
      utterance.lang = lang;
      utterance.rate = Math.max(0.1, Math.min(10, rate));
      utterance.pitch = Math.max(0, Math.min(2, pitch));
      utterance.volume = Math.max(0, Math.min(1, volume));

      if (currentVoice) {
        utterance.voice = currentVoice;
        debug('🗣️', `Using voice: ${currentVoice.name}`);
      }

      debug('⚙️', `Settings: lang=${lang}, rate=${rate}, pitch=${pitch}, volume=${volume}`);

      // Event handlers
      utterance.onstart = () => {
        debug('▶️', 'Started speaking');
        setIsSpeaking(true);
        setIsPaused(false);
        setError(null);
        updateStatus('speaking');
        onStart?.();
      };

      utterance.onend = () => {
        debug('✅', 'Finished speaking');
        setIsSpeaking(false);
        setIsPaused(false);
        updateStatus('idle');
        onEnd?.();
      };

      utterance.onerror = (event) => {
        debug('❌', `Speech error: ${event.error}`, event);
        setIsSpeaking(false);
        setIsPaused(false);
        
        // Don't report 'canceled' or 'interrupted' as errors - these are expected
        // when we cancel speech to start new speech or when component unmounts
        if (event.error === 'canceled' || event.error === 'interrupted') {
          debug('ℹ️', `Speech was ${event.error} (not an error)`);
          updateStatus('idle');
          return;
        }
        
        console.error('Speech synthesis error:', event.error);
        handleError(event.error || 'unknown');
      };

      utterance.onpause = () => {
        debug('⏸️', 'Speech paused');
        setIsPaused(true);
        updateStatus('paused');
      };

      utterance.onresume = () => {
        debug('▶️', 'Speech resumed');
        setIsPaused(false);
        updateStatus('speaking');
      };

      // Start speaking
      try {
        debug('🎙️', 'Calling synth.speak()');
        synth.speak(utterance);
      } catch (err) {
        debug('❌', 'Failed to start speech:', err);
        console.error('Failed to start speech:', err);
        handleError('synthesis-failed');
      }
    },
    [
      isSupported,
      lang,
      rate,
      pitch,
      volume,
      currentVoice,
      onStart,
      onEnd,
      handleError,
      updateStatus,
    ]
  );

  // Pause speaking
  const pause = useCallback(() => {
    const synth = synthRef.current;
    if (synth && isSpeaking && !isPaused) {
      synth.pause();
    }
  }, [isSpeaking, isPaused]);

  // Resume speaking
  const resume = useCallback(() => {
    const synth = synthRef.current;
    if (synth && isPaused) {
      synth.resume();
    }
  }, [isPaused]);

  // Cancel speaking
  const cancel = useCallback(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      updateStatus('idle');
    }
  }, [updateStatus]);

  // Set voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  // Set rate
  const setRate = useCallback((newRate: number) => {
    setRateState(Math.max(0.1, Math.min(10, newRate)));
  }, []);

  // Set pitch
  const setPitch = useCallback((newPitch: number) => {
    setPitchState(Math.max(0, Math.min(2, newPitch)));
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    status,
    voices,
    currentVoice,
    error,
    speak,
    pause,
    resume,
    cancel,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  };
}
