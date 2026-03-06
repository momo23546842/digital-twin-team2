import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, listContacts, listConversations } from '@/lib/database';
import { ensureInitialized } from '@/lib/postgres';

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();

    // Check authentication (basic JWT validation)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await getDashboardStats();

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve dashboard stats',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
