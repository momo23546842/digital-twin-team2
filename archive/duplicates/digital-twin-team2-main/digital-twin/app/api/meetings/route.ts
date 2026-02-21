import { NextRequest, NextResponse } from 'next/server';
import {
  createMeeting,
  getMeeting,
  listMeetings,
  updateMeeting,
} from '@/lib/database';
import { ensureInitialized } from '@/lib/postgres';

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { contact_id, scheduled_at, duration_minutes = 30, notes } = body;

    if (!contact_id || !scheduled_at) {
      return NextResponse.json(
        { error: 'contact_id and scheduled_at are required' },
        { status: 400 }
      );
    }

    const meeting = await createMeeting({
      contact_id,
      scheduled_at: new Date(scheduled_at),
      duration_minutes,
      notes,
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create meeting',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status');

    if (id) {
      const meeting = await getMeeting(id);
      if (!meeting) {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ meeting }, { status: 200 });
    }

    const { meetings, total } = await listMeetings(limit, offset, status || undefined);

    return NextResponse.json(
      {
        meetings,
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Meeting listing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list meetings',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects
    if (updates.scheduled_at && typeof updates.scheduled_at === 'string') {
      updates.scheduled_at = new Date(updates.scheduled_at);
    }

    const meeting = await updateMeeting(id, updates);

    return NextResponse.json({ meeting }, { status: 200 });
  } catch (error) {
    console.error('Meeting update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update meeting',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Cancel the meeting instead of deleting
    const meeting = await updateMeeting(id, { status: 'cancelled' });

    return NextResponse.json({ meeting }, { status: 200 });
  } catch (error) {
    console.error('Meeting deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel meeting',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
