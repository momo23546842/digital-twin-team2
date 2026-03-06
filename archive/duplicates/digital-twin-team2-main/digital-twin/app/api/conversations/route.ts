import { NextRequest, NextResponse } from 'next/server';
import {
  createConversation,
  listConversations,
  getConversation,
  updateConversation,
} from '@/lib/database';
import { ensureInitialized } from '@/lib/postgres';

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { session_id, user_id, title } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    const conversation = await createConversation(
      session_id,
      user_id,
      title
    );

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Conversation creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create conversation',
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
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const conversations = await listConversations(userId || undefined, limit, offset);

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error('Conversation listing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list conversations',
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

    const conversation = await updateConversation(id, updates);

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error('Conversation update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update conversation',
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

    // For now, just archive the conversation instead of deleting
    const conversation = await updateConversation(id, { status: 'archived' });

    return NextResponse.json({ conversation }, { status: 200 });
  } catch (error) {
    console.error('Conversation deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete conversation',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
