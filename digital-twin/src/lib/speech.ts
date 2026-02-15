type ResultCallback = (text: string, isFinal: boolean) => void;
type ErrorCallback = (err: any) => void;

export class VoiceRecognition {
  private recognition: any = null;
  private listening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void
  ) {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    // Force stop if already running
    if (this.listening) {
      console.log('Force stopping previous recognition...');
      try {
        this.recognition.abort(); // Use abort() instead of stop()
      } catch (e) {
        console.log('Abort error (ignored):', e);
      }
      this.listening = false;
    }

    // Always create a fresh recognition instance to avoid state issues
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Set up event handlers
    this.recognition.onstart = () => {
      console.log('✓ Recognition started');
      this.listening = true;
    };

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;

      console.log('Transcript:', transcript, 'Final:', isFinal);
      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Recognition error:', event.error);
      this.listening = false;

      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted (expected)');
      } else if (event.error === 'no-speech') {
        console.log('No speech detected');
      }

      if (onError && event.error !== 'aborted') {
        onError(event.error);
      }
    };

    this.recognition.onend = () => {
      console.log('✓ Recognition ended');
      this.listening = false;
    };

    // Start recognition
    try {
      this.recognition.start();
      console.log('Starting recognition...');
    } catch (error) {
      console.error('Failed to start:', error);
      this.listening = false;
      if (onError) onError(error);
    }
  }

  stopListening() {
    if (this.recognition && this.listening) {
      try {
        console.log('Stopping recognition...');
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping:', error);
      }
    }
    this.listening = false;
  }

  isListening(): boolean {
    return this.listening;
  }

  setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}

export class VoiceSynthesis {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return !!this.synth;
  }

  speak(
    text: string,
    options?: {
      lang?: string;
      rate?: number;
      pitch?: number;
      volume?: number;
      voice?: SpeechSynthesisVoice;
    }
  ) {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = options?.lang || 'en-US';
    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;
    utterance.volume = options?.volume || 1.0;

    if (options?.voice) {
      utterance.voice = options.voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() || [];
  }
}

export default { VoiceRecognition, VoiceSynthesis };
