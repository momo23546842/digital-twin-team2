"use client";

import { useEffect, useState } from "react";
import { Phone, Play, Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import type { CallRecord } from "@/app/actions/calls";
import { getRecentCalls } from "@/app/actions/calls";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-50 text-green-700 border-green-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    no_answer: "bg-gray-50 text-gray-600 border-gray-200",
  };

  const labels: Record<string, string> = {
    completed: "Completed",
    in_progress: "In Progress",
    failed: "Failed",
    no_answer: "No Answer",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] ?? styles.failed}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Duration formatter
// ---------------------------------------------------------------------------
function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Expandable row (for mobile summary + recording)
// ---------------------------------------------------------------------------
function CallRow({ call }: { call: CallRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop row */}
      <tr
        className="hidden sm:table-row hover:bg-violet-50/40 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
          {formatDate(call.startedAt)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-800 font-medium whitespace-nowrap">
          {call.callerNumber}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
          {formatDuration(call.duration)}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={call.status} />
        </td>
        <td className="px-4 py-3">
          {call.recordingUrl ? (
            <a
              href={call.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-violet-50 text-violet-700 border border-violet-200
                         hover:bg-violet-100 hover:border-violet-300 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Play
            </a>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
      </tr>

      {/* Desktop expanded summary */}
      {expanded && call.summary && (
        <tr className="hidden sm:table-row bg-violet-50/30">
          <td colSpan={5} className="px-4 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Summary: </span>
            {call.summary}
          </td>
        </tr>
      )}

      {/* Mobile card */}
      <tr className="sm:hidden">
        <td colSpan={5} className="p-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left px-4 py-3 hover:bg-violet-50/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {call.callerNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(call.startedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={call.status} />
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {expanded && (
              <div className="mt-3 ml-12 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5" />
                  Duration: {formatDuration(call.duration)}
                </div>
                {call.summary && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {call.summary}
                  </p>
                )}
                {call.recordingUrl && (
                  <a
                    href={call.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                               bg-violet-50 text-violet-700 border border-violet-200
                               hover:bg-violet-100 hover:border-violet-300 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Play Recording
                  </a>
                )}
              </div>
            )}
          </button>
        </td>
      </tr>
    </>
  );
}

// ---------------------------------------------------------------------------
// CallHistory (main export)
// ---------------------------------------------------------------------------
export default function CallHistory() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentCalls(20)
      .then(setCalls)
      .catch((err) => console.error("Failed to load calls:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
          <Phone className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold gradient-text">Call History</h2>
          <p className="text-xs text-gray-500">Recent phone interactions</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="px-5 py-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            Loading calls…
          </div>
        </div>
      ) : calls.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Phone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No calls yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Calls will appear here once your AI twin starts receiving them.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Desktop header */}
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Caller
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recording
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calls.map((call) => (
                <CallRow key={call.id} call={call} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
