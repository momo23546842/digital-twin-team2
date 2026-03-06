"use client";
import { useState, useEffect, useRef } from 'react';

export default function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState('');
  const [recording, setRecording] = useState(false);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  // initialize SpeechRecognition only on the client
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSpeechAvailable(true);

    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = true;

    recog.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      if (finalTranscript) {
        setValue(finalTranscript);
        onSend(finalTranscript);
        setValue('');
      } else {
        setValue(interim);
      }
    };

    recog.onend = () => {
      setRecording(false);
    };

    recog.onerror = () => {
      setRecording(false);
    };

    recognitionRef.current = recog;
  }, [onSend]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const t = value.trim();
    if (!t) return;
    onSend(t);
    setValue('');
  }

  function toggleRecording() {
    const recog = recognitionRef.current;
    if (!recog) return;
    if (recording) {
      recog.stop();
    } else {
      try {
        recog.start();
        setRecording(true);
      } catch (err) {
        console.error('Speech recognition start failed', err);
      }
    }
  }

  return (
    <form onSubmit={submit} className="chat-input-form flex items-center space-x-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Send a message..."
        className="chat-input flex-1"
      />
      {speechAvailable && (
        <button
          type="button"
          onClick={toggleRecording}
          className={`chat-mic-btn ${recording ? 'recording' : ''}`}
          title={recording ? 'Stop recording' : 'Record voice'}
        >
          {recording ? '🛑' : '🎤'}
        </button>
      )}
      <button type="submit" className="chat-send-btn">Send</button>
    </form>
  );
}
