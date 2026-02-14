'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, Clock, Phone } from 'lucide-react';
import { getRecentCalls } from '../actions/calls';

interface CallRecord {
  id: string;
  callId: string;
  callerNumber: string;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CallHistory() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentCalls(50);
      setCalls(data);
    } catch (error) {
      console.error('Failed to load calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (seconds == null) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const toggleAudio = (callId: string, recordingUrl: string) => {
    if (playingCallId === callId) {
      audioRef.current?.pause();
      setPlayingCallId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(recordingUrl);
      audio.onended = () => setPlayingCallId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingCallId(callId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Phone className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p className="text-lg font-medium">No calls yet</p>
        <p className="text-sm mt-1">Call history will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Caller Number
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Duration
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                Recording
              </th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr
                key={call.id}
                className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-4 px-4 text-sm text-slate-300">
                  {formatDate(call.startedAt || call.createdAt)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-mono text-slate-300">
                      {call.callerNumber}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-300">
                      {formatDuration(call.duration)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      call.status
                    )}`}
                  >
                    {call.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {call.recordingUrl ? (
                    <button
                      onClick={() => toggleAudio(call.id, call.recordingUrl!)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-colors"
                    >
                      {playingCallId === call.id ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span className="text-sm">Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span className="text-sm">Play</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">No recording</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {calls.map((call) => (
          <div
            key={call.id}
            className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-mono text-slate-300">
                  {call.callerNumber}
                </span>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                  call.status
                )}`}
              >
                {call.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>{formatDate(call.startedAt || call.createdAt)}</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDuration(call.duration)}</span>
              </div>
            </div>

            {call.recordingUrl && (
              <button
                onClick={() => toggleAudio(call.id, call.recordingUrl!)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-colors"
              >
                {playingCallId === call.id ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span className="text-sm">Pause Recording</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="text-sm">Play Recording</span>
                  </>
                )}
              </button>
            )}

            {call.summary && (
              <div className="pt-2 border-t border-slate-700">
                <p className="text-xs text-slate-400 line-clamp-2">
                  {call.summary}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
