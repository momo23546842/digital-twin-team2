import { NextRequest, NextResponse } from 'next/server';
import { trackEvent } from '@/lib/database';
import { ensureInitialized } from '@/lib/postgres';

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { event_type, conversation_id, user_id, event_data } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: 'event_type is required' },
        { status: 400 }
      );
    }

    await trackEvent(event_type, conversation_id, user_id, event_data);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track event',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
