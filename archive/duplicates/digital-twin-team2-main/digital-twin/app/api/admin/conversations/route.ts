import { NextRequest, NextResponse } from 'next/server';
import {
  listConversations,
  getConversation,
  getConversationMessages,
} from '@/lib/database';
import { ensureInitialized } from '@/lib/postgres';

/**
 * GET /api/admin/conversations
 * List all conversations with pagination
 */
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();

    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const id = searchParams.get('id');

    if (id) {
      const conversation = await getConversation(id);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      // Get messages for this conversation if requested
      const includeMessages = searchParams.get('include_messages') === 'true';
      let messages = undefined;
      if (includeMessages) {
        messages = await getConversationMessages(id);
      }

      return NextResponse.json(
        { conversation, messages },
        { status: 200 }
      );
    }

    const conversations = await listConversations(undefined, limit, offset);
    const total = conversations.length; // In production, get total from database count

    return NextResponse.json(
      {
        conversations,
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin conversations listing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list conversations',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
