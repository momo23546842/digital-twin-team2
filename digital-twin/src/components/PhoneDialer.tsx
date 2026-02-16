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
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Open phone dialer"
      >
        <Phone className="w-5 h-5" />
        <span className="hidden sm:inline">Call AI Twin</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96">
      <div className={`rounded-2xl border-2 shadow-2xl overflow-hidden transition-all duration-300 ${getStateBgColor()}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-700">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">AI Phone Call</span>
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800">Call Mode</span>
              <span className="text-xs text-gray-500">
                {webCallMode ? "Web Call (hear voice in browser)" : "Phone Number Call (PSTN)"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (callState === "dialing" || callState === "ringing" || callState === "in_progress") return;
                setWebCallMode((p) => !p);
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                webCallMode ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              aria-label="Toggle call mode"
            >
              {webCallMode ? "WEB" : "PSTN"}
            </button>
          </div>

          {/* Mic status (web mode) */}
          {webCallMode && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              {micReady ? <Mic className="w-4 h-4 text-emerald-600" /> : <MicOff className="w-4 h-4 text-gray-400" />}
              <span>
                {micReady
                  ? "Microphone ready"
                  : "Microphone permission not granted yet (you’ll be asked on call start)"}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Idle State */}
          {callState === "idle" && (
            <div className="space-y-4">
              {/* PSTN input only */}
              {!webCallMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneInput(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-11 pr-4 py-3 text-lg font-mono border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition-all bg-white"
                    />
                  </div>
                  {error && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">Enter number in E.164 format (e.g. +14155551234)</p>
                </div>
              )}

              {/* Web mode hint */}
              {webCallMode && (
                <div className="rounded-xl border bg-white p-3">
                  <p className="text-sm font-semibold text-gray-800">Web Call</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Click “Start Web Call”, allow microphone, and you’ll hear Momoyo’s voice in the browser.
                  </p>
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleCall}
                disabled={!webCallMode && (!phoneNumber || phoneNumber.length < 8)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
              >
                <Phone className="w-5 h-5" />
                {webCallMode ? "Start Web Call" : "Call with AI Twin"}
              </button>
            </div>
          )}

          {/* Dialing */}
          {callState === "dialing" && (
            <div className="text-center py-4 space-y-3">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
              <p className="text-lg font-semibold text-gray-800">{webCallMode ? "Starting Web Call..." : "Connecting..."}</p>
              {!webCallMode && (
                <p className="text-sm text-gray-500 font-mono">{formatDisplayNumber(phoneNumber)}</p>
              )}
              {webCallMode && (
                <p className="text-xs text-gray-500">Please allow microphone access in the browser prompt.</p>
              )}
            </div>
          )}

          {/* Ringing (PSTN only) */}
          {callState === "ringing" && !webCallMode && (
            <div className="text-center py-4 space-y-3">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 bg-amber-400/30 rounded-full animate-ping" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
                  <PhoneCall className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-800">Ringing...</p>
              <p className="text-sm text-gray-500 font-mono">{formatDisplayNumber(phoneNumber)}</p>
              <button
                onClick={handleHangUp}
                className="mt-2 flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}

          {/* In Progress */}
          {callState === "in_progress" && (
            <div className="text-center py-4 space-y-3">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse" />
                <div className="relative flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <User className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <p className="text-lg font-semibold text-green-800">
                {webCallMode ? "Web Call in Progress" : "Call in Progress"}
              </p>

              <div className="flex items-center justify-center gap-2 text-green-700">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">{formatDuration(callDuration)}</span>
              </div>

              {!webCallMode && (
                <p className="text-sm text-gray-500 font-mono">{formatDisplayNumber(phoneNumber)}</p>
              )}

              <p className="text-xs text-gray-400">
                {webCallMode ? "You should hear the assistant in your browser audio." : "AI Twin is speaking on the call"}
              </p>

              <button
                onClick={handleHangUp}
                className="mt-2 flex items-center justify-center gap-2 mx-auto px-6 py-2.5 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 active:scale-95 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </div>
          )}

          {/* Completed */}
          {callState === "completed" && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-blue-500 mx-auto" />
              <p className="text-lg font-semibold text-gray-800">Call Ended</p>
              {callDuration > 0 && <p className="text-sm text-gray-500">Duration: {formatDuration(callDuration)}</p>}
              <button
                onClick={handleReset}
                className="mt-2 flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                New Call
              </button>
            </div>
          )}

          {/* Failed */}
          {callState === "failed" && (
            <div className="text-center py-4 space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-lg font-semibold text-gray-800">Call Failed</p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleReset}
                className="mt-2 flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
