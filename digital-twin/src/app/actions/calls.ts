"use server";

import { prisma } from "@/lib/prisma";

export type CallRecord = {
  id: string;
  callId: string;
  callerNumber: string | null;
  status: string;
  startedAt: string; // ISO string (serialisable)
  endedAt: string | null;
  duration: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getRecentCalls(limit: number = 20): Promise<CallRecord[]> {
  try {
    if (!prisma) {
      console.warn('[actions/calls] Prisma not initialized');
      return [];
    }
    
    const calls = await prisma.phoneCall.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        callId: true,
        callerNumber: true,
        status: true,
        startedAt: true,
        endedAt: true,
        duration: true,
        recordingUrl: true,
        transcript: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Serialise Date objects for client components
    return calls.map((call) => ({
      ...call,
      startedAt: call.startedAt?.toISOString() ?? new Date().toISOString(),
      endedAt: call.endedAt?.toISOString() ?? null,
      createdAt: call.createdAt.toISOString(),
      updatedAt: call.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("[actions/calls] Failed to fetch recent calls:", error);
    return [];
  }
}

