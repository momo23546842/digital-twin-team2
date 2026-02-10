'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Debug logging helper
const debug = (emoji: string, message: string, ...args: unknown[]) => {
  console.log(`${emoji} [VoiceRecognition] ${message}`, ...args);
};

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type VoiceRecognitionStatus = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'error' 
  | 'unsupported';

export interface VoiceRecognitionError {
  code: string;
  message: string;
  messageJa: string;
}

export interface UseVoiceRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: VoiceRecognitionError) => void;
  onStatusChange?: (status: VoiceRecognitionStatus) => void;
  onEnd?: () => void;
}

export interface UseVoiceRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  status: VoiceRecognitionStatus;
  transcript: string;
  interimTranscript: string;
  error: VoiceRecognitionError | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Error messages
const ERROR_MESSAGES: Record<string, VoiceRecognitionError> = {
  'not-allowed': {
    code: 'not-allowed',
    message: 'Microphone access was denied. Please allow microphone access in your browser settings.',
    messageJa: 'マイクへのアクセスが拒否されました。',
  },
  'no-speech': {
    code: 'no-speech',
    message: 'No speech was detected. Please try speaking again.',
    messageJa: '音声が検出されませんでした。',
  },
  'audio-capture': {
    code: 'audio-capture',
    message: 'No microphone was found. Please check your microphone connection.',
    messageJa: 'マイクが見つかりませんでした。',
  },
  'network': {
    code: 'network',
    message: 'Network error occurred. Please check your internet connection.',
    messageJa: 'ネットワークエラーが発生しました。',
  },
  'aborted': {
    code: 'aborted',
    message: 'Speech recognition was aborted.',
    messageJa: '音声認識が中止されました。',
  },
  'language-not-supported': {
    code: 'language-not-supported',
    message: 'The selected language is not supported.',
    messageJa: '選択した言語はサポートされていません。',
  },
  'service-not-allowed': {
    code: 'service-not-allowed',
    message: 'Speech recognition service is not allowed.',
    messageJa: '音声認識サービスが許可されていません。',
  },
  'unsupported': {
    code: 'unsupported',
    message: 'Your browser does not support speech recognition. Please use Chrome or Safari.',
    messageJa: 'お使いのブラウザは音声認識に対応していません。',
  },
  'unknown': {
    code: 'unknown',
    message: 'An unknown error occurred during speech recognition.',
    messageJa: '音声認識中に不明なエラーが発生しました。',
  },
};

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const {
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    onTranscript,
    onError,
    onStatusChange,
    onEnd,
  } = options;

  // State
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [status, setStatus] = useState<VoiceRecognitionStatus>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<VoiceRecognitionError | null>(null);

  // Refs for stable access (CRITICAL: prevents cleanup/setup loops)
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  
  // Callback refs - store latest callbacks without causing re-renders
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const onStatusChangeRef = useRef(onStatusChange);
  const onEndRef = useRef(onEnd);
  
  // Config refs
  const langRef = useRef(lang);
  const continuousRef = useRef(continuous);
  const interimResultsRef = useRef(interimResults);

  // Keep callback refs updated (no effect cleanup needed)
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);
  
  // Keep config refs updated
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { continuousRef.current = continuous; }, [continuous]);
  useEffect(() => { interimResultsRef.current = interimResults; }, [interimResults]);

  // Update status helper (uses ref for callback)
  const updateStatus = useCallback((newStatus: VoiceRecognitionStatus) => {
    setStatus(newStatus);
    onStatusChangeRef.current?.(newStatus);
  }, []);

  // Handle error helper (uses ref for callback)
  const handleError = useCallback((errorCode: string) => {
    const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['unknown'];
    setError(errorInfo);
    updateStatus('error');
    onErrorRef.current?.(errorInfo);
  }, [updateStatus]);

  // INITIALIZE ONCE on mount - empty dependency array!
  useEffect(() => {
    if (isInitializedRef.current) {
      debug('⚠️', 'Already initialized, skipping');
      return;
    }

    debug('🔍', 'Initializing speech recognition (ONCE)...');
    
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      debug('❌', 'Speech Recognition not supported');
      setIsSupported(false);
      setStatus('unsupported');
      const unsupportedError = ERROR_MESSAGES['unsupported'];
      setError(unsupportedError);
      onErrorRef.current?.(unsupportedError);
      return;
    }

    debug('✅', 'Speech Recognition API available');
    setIsSupported(true);

    // Create recognition instance ONCE
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    isInitializedRef.current = true;

    // Set initial config
    recognition.continuous = continuousRef.current;
    recognition.interimResults = interimResultsRef.current;
    recognition.lang = langRef.current;

    // Event handlers - use refs to access latest callbacks
    recognition.onstart = () => {
      debug('🎤', 'Recognition started - listening for audio');
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      onStatusChangeRef.current?.('listening');
      setStatus('listening');
    };

    recognition.onend = () => {
      debug('🛑', 'Recognition ended');
      setIsListening(false);
      isListeningRef.current = false;
      setInterimTranscript('');
      setStatus((prev) => (prev !== 'error' ? 'idle' : prev));
      onStatusChangeRef.current?.('idle');
      // Notify caller (for auto-restart in call mode)
      onEndRef.current?.();
    };

    recognition.onaudiostart = () => {
      debug('🔊', 'Audio capture started');
    };

    recognition.onaudioend = () => {
      debug('🔇', 'Audio capture ended');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      debug('📝', 'Recognition result received');
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        const confidence = result[0].confidence;

        debug('📄', `Result ${i}: "${text}" (final: ${result.isFinal}, confidence: ${(confidence * 100).toFixed(1)}%)`);

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      if (finalTranscript) {
        debug('✅', `Final transcript: "${finalTranscript}"`);
        setTranscript((prev) => (prev ? prev + ' ' : '') + finalTranscript);
        onTranscriptRef.current?.(finalTranscript, true);
      }

      setInterimTranscript(interim);
      if (interim) {
        debug('💭', `Interim transcript: "${interim}"`);
        onTranscriptRef.current?.(interim, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "aborted" and "no-speech" are expected, not errors
      if (event.error === 'aborted' || event.error === 'no-speech') {
        debug('ℹ️', `Recognition ${event.error} (expected behavior)`);
        return;
      }
      
      debug('❌', `Recognition error: ${event.error}`, event);
      console.error('Speech recognition error:', event.error);
      
      const errorInfo = ERROR_MESSAGES[event.error] || ERROR_MESSAGES['unknown'];
      setError(errorInfo);
      setStatus('error');
      onStatusChangeRef.current?.('error');
      onErrorRef.current?.(errorInfo);
    };

    recognition.onspeechend = () => {
      debug('🗣️', 'Speech ended (user stopped talking)');
    };

    recognition.onnomatch = () => {
      debug('⚠️', 'No speech match found');
    };

    debug('✅', 'Recognition instance created and handlers attached');

    // Cleanup ONLY on unmount
    return () => {
      debug('🧹', 'Component unmounting - cleaning up recognition');
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          debug('⚠️', 'Error during cleanup abort:', e);
        }
      }
      recognitionRef.current = null;
      isInitializedRef.current = false;
    };
  }, []); // EMPTY - run only on mount/unmount

  // Update recognition config when settings change (WITHOUT recreating instance)
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    // Only update if not currently listening (can't change config while active)
    if (!isListeningRef.current) {
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;
      debug('⚙️', `Config updated: lang=${lang}, continuous=${continuous}, interimResults=${interimResults}`);
    }
  }, [lang, continuous, interimResults]);

  // Start listening - triggered by user action only
  const startListening = useCallback(async () => {
    debug('🔴', 'Start listening requested');
    
    const recognition = recognitionRef.current;
    if (!recognition) {
      debug('❌', 'Recognition not initialized');
      handleError('unsupported');
      return;
    }

    // Guard: already listening (via ref for synchronous check)
    if (isListeningRef.current) {
      debug('⚠️', 'Already listening (isListeningRef), ignoring start request');
      return;
    }

    // Request microphone permission first
    try {
      debug('🎤', 'Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      debug('✅', 'Microphone permission granted');
      stream.getTracks().forEach(track => track.stop());
    } catch (permErr) {
      debug('❌', 'Microphone permission denied:', permErr);
      handleError('not-allowed');
      return;
    }

    // Apply current config before starting
    recognition.continuous = continuousRef.current;
    recognition.interimResults = interimResultsRef.current;
    recognition.lang = langRef.current;

    try {
      setError(null);
      debug('🎙️', 'Starting recognition...');
      
      // Set flag BEFORE calling start to prevent race conditions
      isListeningRef.current = true;
      recognition.start();
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorName = err instanceof Error ? err.name : '';
      
      // Handle "already started" gracefully - not a real error
      if (errorName === 'InvalidStateError' || errorMessage.includes('already started')) {
        debug('ℹ️', 'Recognition already started (InvalidStateError) - ignoring');
        // Recognition is running, so isListeningRef should stay true
        return;
      }
      
      // Reset flag on actual failure
      isListeningRef.current = false;
      debug('❌', 'Failed to start recognition:', err);
      console.error('Failed to start recognition:', err);
      handleError('unknown');
    }
  }, [handleError]);

  // Stop listening - triggered by user action only
  const stopListening = useCallback(() => {
    debug('⏹️', 'Stop listening requested');
    const recognition = recognitionRef.current;
    
    if (!recognition) {
      debug('⚠️', 'No recognition instance to stop');
      return;
    }

    // Guard: not currently listening
    if (!isListeningRef.current) {
      debug('ℹ️', 'Not listening, nothing to stop');
      return;
    }

    try {
      recognition.stop();
      debug('✅', 'Recognition stop command sent');
    } catch (err: unknown) {
      const errorName = err instanceof Error ? err.name : '';
      
      // InvalidStateError on stop means it wasn't running - that's fine
      if (errorName === 'InvalidStateError') {
        debug('ℹ️', 'Recognition was not running (InvalidStateError on stop)');
        isListeningRef.current = false;
        setIsListening(false);
        return;
      }
      
      debug('❌', 'Failed to stop recognition:', err);
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    updateStatus('idle');
  }, [updateStatus]);

  return {
    isSupported,
    isListening,
    status,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
