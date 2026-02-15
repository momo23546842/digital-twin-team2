import { NextRequest, NextResponse } from 'next/server';
import { upsertVisitor, getVisitorByEmail } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received visitor info:', body);

    const { visitorId, email, name, company, role, phone } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Save visitor info to database
    const visitor = await upsertVisitor({
      email,
      name: name || undefined,
      company: company || undefined,
      role: role || undefined,
      phone: phone || undefined,
    });

    console.log('Visitor saved successfully:', visitor.id);

    return NextResponse.json({
      success: true,
      visitor: {
        id: visitor.id,
        email: visitor.email,
        name: visitor.name,
      },
    });
  } catch (error) {
    console.error('Visitor API error:', error);
    return NextResponse.json(
      { error: 'Failed to save visitor information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const visitor = await getVisitorByEmail(email);

    if (!visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      visitor,
    });
  } catch (error) {
    console.error('Visitor GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor information' },
      { status: 500 }
    );
  }
}
