import { NextRequest, NextResponse } from 'next/server';
import { listContacts, getContact, updateContact } from '@/lib/database';
import { ensureInitialized } from '@/lib/postgres';

/**
 * GET /api/admin/contacts
 * List all contacts with pagination and filtering
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
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    if (id) {
      const contact = await getContact(id);
      if (!contact) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ contact }, { status: 200 });
    }

    const { contacts, total } = await listContacts(limit, offset, status || undefined);

    return NextResponse.json(
      {
        contacts,
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin contacts listing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list contacts',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/contacts
 * Update a contact
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const contact = await updateContact(id, updates);

    return NextResponse.json({ contact }, { status: 200 });
  } catch (error) {
    console.error('Admin contact update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update contact',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
