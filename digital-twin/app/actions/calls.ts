'use server';

import { prisma } from '@/lib/prisma';

/**
 * Fetch recent phone calls from the database.
 * @param limit - Maximum number of calls to return (default: 50)
 * @returns Array of PhoneCall records sorted by most recent first
 */
export async function getRecentCalls(limit: number = 50) {
  try {
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
    throw new Error('Failed to fetch call history');
  }
}
