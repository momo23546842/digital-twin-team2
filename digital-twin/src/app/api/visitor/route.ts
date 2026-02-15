import { NextRequest, NextResponse } from 'next/server';
import { upsertVisitor } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { visitorId, email, name, company, role, phone } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Save visitor info to database
    const visitor = await upsertVisitor({
      email,
      name,
      company,
      role,
      phone,
    });
    
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
      { error: 'Failed to save visitor information' },
      { status: 500 }
    );
  }
}

// Get visitor info
export async function GET(req: NextRequest) {
  try {
    const visitorId = req.headers.get('x-visitor-id');
    
    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID required' },
        { status: 400 }
      );
    }
    
    // Here you could fetch visitor by ID if needed
    // For now, return a simple response
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Visitor GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor information' },
      { status: 500 }
    );
  }
}
