"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Mic,
  MicOff,
} from "lucide-react";
import Vapi from "@vapi-ai/web";

type CallState = "idle" | "dialing" | "ringing" | "in_progress" | "completed" | "failed";

/**
 * PhoneDialer
 * - Web Call (WebRTC): plays audio in the browser (what you want)
 * - PSTN Call: calls a phone number via your existing /api/calls endpoint (optional)
 *
 * ENV required:
 * - NEXT_PUBLIC_VAPI_PUBLIC_KEY
 *
 * Optional (if you want PSTN mode too):
 * - Your existing backend /api/calls must work
 *
 * Vapi:
 * - Make sure Assistant has "Web Call" transport enabled in dashboard.
 */
export default function PhoneDialer() {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Mode toggle:
  // true  = Web Call (WebRTC) -> you can hear voice in browser
  // false = PSTN call via /api/calls -> calls a phone number (no browser audio)
  const [webCallMode, setWebCallMode] = useState(true);

  // PSTN input
  const [phoneNumber, setPhoneNumber] = useState("");

  const [callState, setCallState] = useState<CallState>("idle");
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // WebRTC Vapi instance
  const vapiRef = useRef<Vapi | null>(null);
  const [micReady, setMicReady] = useState(false);

  // ---- helpers ----
  const startTimer = useCallback(() => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatDisplayNumber = (num: string) => {
    if (!num) return "";
    if (num.startsWith("+1") && num.length === 12) {
      return `+1 (${num.slice(2, 5)}) ${num.slice(5, 8)}-${num.slice(8)}`;
    }
    return num;
  };

  const handlePhoneInput = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    if (cleaned && !cleaned.startsWith("+")) cleaned = "+" + cleaned;
    setPhoneNumber(cleaned);
    setError(null);
  };

  // Poll for PSTN call status (your existing endpoint)
  const startPolling = useCallback(
    (id: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/calls?callId=${id}`);
          if (!res.ok) return;
          const data = await res.json();

          if (data.status === "ended" || data.status === "completed") {
            setCallState("completed");
            stopTimer();
            if (pollRef.current) clearInterval(pollRef.current);
          } else if (data.status === "in-progress" || data.status === "active") {
            setCallState((prev) => {
              if (prev !== "in_progress") {
                startTimer();
                return "in_progress";
              }
              return prev;
            });
          }
        } catch {
          // ignore
        }
      }, 3000);
    },
    [startTimer, stopTimer],
  );

  // ---- init Vapi WebRTC ----
  useEffect(() => {
    if (!vapiRef.current) {
      const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      if (key) {
        vapiRef.current = new Vapi(key);
      }
    }

    // Optional: ask mic permission up-front (helps avoid “silent” start confusion)
    // We do it only in Web mode and only once.
    const warmUpMic = async () => {
      if (!webCallMode) return;
      try {
        // This prompts mic permission; we stop immediately after getting stream.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setMicReady(true);
      } catch {
        setMicReady(false);
      }
    };

    warmUpMic();

    return () => {
      stopTimer();
      if (pollRef.current) clearInterval(pollRef.current);

      try {
        vapiRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, [stopTimer, webCallMode]);

  // ---- actions ----
  const handleCall = async () => {
    setError(null);

    // ✅ Web Call (WebRTC) — browser audio will work here
    if (webCallMode) {
      try {
        const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        if (!key) {
          setError("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set in .env.local");
          setCallState("failed");
          return;
        }
        if (!vapiRef.current) vapiRef.current = new Vapi(key);

        setCallState("dialing");

        // Start WebRTC call
        await vapiRef.current.start("0dc023d6-733c-49bd-9f3e-3ac06066d007");

        setCallState("in_progress");
        startTimer();
        return;
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Web call failed");
        setCallState("failed");
        return;
      }
    }

    // ✅ PSTN Call (optional)
    if (!phoneNumber || phoneNumber.length < 8) {
      setError("Please enter a valid phone number");
      return;
    }

    setCallState("dialing");

    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate call");

      setCallId(data.callId || null);
      setCallState("ringing");

      // simulated progression
      setTimeout(() => {
        setCallState((prev) => {
          if (prev === "ringing") {
            startTimer();
            return "in_progress";
          }
          return prev;
        });
      }, 3000);

      if (data.callId) startPolling(data.callId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Call failed");
      setCallState("failed");
    }
  };

  const handleHangUp = () => {
    // stop WebRTC if active
    try {
      vapiRef.current?.stop();
    } catch {
      // ignore
    }

    stopTimer();
    if (pollRef.current) clearInterval(pollRef.current);

    setCallState("completed");
    setTimeout(() => {
      setCallState("idle");
      setCallId(null);
      setCallDuration(0);
    }, 1200);
  };

  const handleReset = () => {
    try {
      vapiRef.current?.stop();
    } catch {
      // ignore
    }

    setCallState("idle");
    setCallId(null);
    setError(null);
    setCallDuration(0);
    setPhoneNumber("");
  };

  const getStateBgColor = () => {
    switch (callState) {
      case "dialing":
      case "ringing":
        return "bg-amber-50 border-amber-200";
      case "in_progress":
        return "bg-green-50 border-green-200";
      case "completed":
        return "bg-blue-50 border-blue-200";
      case "failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  // ---- UI ----
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-105 transform transition duration-150 ring-2 ring-[#25D366]/30"
        aria-label="Open phone dialer"
      >
        <Phone className="w-6 h-6" />
        <span className="hidden sm:inline font-semibold">Call</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={() => {
        if (callState === 'idle' || callState === 'completed' || callState === 'failed') {
          setIsOpen(false);
          handleReset();
        }
      }} />

      {/* Centered modal */}
      <div className={`relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${getStateBgColor()}`}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0b1220]">
          <div className="flex items-center gap-3">
            <PhoneCall className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">AI Phone Call</span>
          </div>
          <button
            onClick={() => {
              if (callState === "idle" || callState === "completed" || callState === "failed") {
                setIsOpen(false);
                handleReset();
              }
            }}
            className="text-white/70 hover:text-white transition-colors"
            disabled={callState === "dialing" || callState === "ringing" || callState === "in_progress"}
            aria-label="Close call modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 bg-transparent">
          {/* Idle / Start Call UI */}
          {callState === 'idle' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-md">
                <User className="w-16 h-16 text-[#0b1220]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Digital Twin</h3>
                <p className="text-sm text-gray-300">Calling...</p>
              </div>

              <div className="w-full">
                <button
                  onClick={handleCall}
                  className="w-full py-3 bg-[#25D366] text-white rounded-full font-semibold shadow-md hover:brightness-95 transition"
                >
                  Start Web Call
                </button>
              </div>

              <button
                onClick={() => { setIsOpen(false); handleReset(); }}
                className="text-sm text-gray-300"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Dialing / In Progress */}
          {callState === 'dialing' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
              <h3 className="text-lg font-semibold text-white">{webCallMode ? 'Starting Web Call...' : 'Connecting...'}</h3>
            </div>
          )}

          {callState === 'in_progress' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-md">
                <User className="w-16 h-16 text-[#0b1220]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Digital Twin</h3>
                <div className="mt-2 text-sm text-gray-300 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatDuration(callDuration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button className="p-3 rounded-full bg-white/5 text-white">
                  <Mic className="w-5 h-5" />
                </button>

                <button
                  onClick={handleHangUp}
                  className="p-4 rounded-full bg-red-600 text-white shadow-md"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Completed / Failed */}
          {callState === 'completed' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto" />
              <h3 className="text-lg font-semibold text-white">Call Ended</h3>
              <p className="text-sm text-gray-300">Duration: {formatDuration(callDuration)}</p>
              <button onClick={() => { setIsOpen(false); handleReset(); }} className="py-2 px-4 bg-[#4361ee] text-white rounded-full">Close</button>
            </div>
          )}

          {callState === 'failed' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-white">Call Failed</h3>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button onClick={handleReset} className="py-2 px-4 bg-[#4361ee] text-white rounded-full">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
