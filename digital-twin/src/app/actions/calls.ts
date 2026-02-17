<<<<<<< HEAD
'use server';

import { prisma } from '@/lib/prisma';

/**
 * Fetch recent phone calls from the database.
 * @param limit - Maximum number of calls to return (default: 50)
 * @returns Array of PhoneCall records sorted by most recent first
 */
export async function getRecentCalls(limit: number = 50) {
  try {
    if (!prisma) {
      console.warn('Prisma not initialized, returning empty array');
      return [];
    }
    const calls = await prisma.phoneCall.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Convert dates to ISO strings for serialization
    return calls.map((call) => ({
      ...call,
      startedAt: call.startedAt?.toISOString() ?? null,
      endedAt: call.endedAt?.toISOString() ?? null,
      createdAt: call.createdAt.toISOString(),
      updatedAt: call.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('[getRecentCalls] Database error:', error);
=======
"use server";

import { prisma } from "@/lib/prisma";

export type CallRecord = {
  id: string;
  callId: string;
  callerNumber: string;
  status: string;
  startedAt: string; // ISO string (serialisable)
  endedAt: string | null;
  duration: number | null;
  recordingUrl: string | null;
  summary: string | null;
};

export async function getRecentCalls(limit: number = 20): Promise<CallRecord[]> {
  try {
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
        summary: true,
      },
    });

    // Serialise Date objects for client components
    return calls.map((call) => ({
      ...call,
      startedAt: call.startedAt.toISOString(),
      endedAt: call.endedAt?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("[actions/calls] Failed to fetch recent calls:", error);
>>>>>>> origin/main
    return [];
  }
}
