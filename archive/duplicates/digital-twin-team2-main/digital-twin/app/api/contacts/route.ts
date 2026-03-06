import { NextRequest, NextResponse } from 'next/server';
import {
  createContact,
  listContacts,
  getContact,
  updateContact,
} from '@/lib/database';
import { ensureInitialized } from '@/lib/postgres';

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const {
      email,
      name,
      phone,
      company,
      title,
      message,
      source,
      conversation_id,
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'email and name are required' },
        { status: 400 }
      );
    }

    const contact = await createContact({
      email,
      name,
      phone,
      company,
      title,
      message,
      source: source || 'chat',
      conversation_id,
    });

    // Send email notification (optional - implement as needed)
    // await sendContactNotification(contact);

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error('Contact creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create contact',
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
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status');

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
    console.error('Contact listing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to list contacts',
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

    const contact = await updateContact(id, updates);

    return NextResponse.json({ contact }, { status: 200 });
  } catch (error) {
    console.error('Contact update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update contact',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
