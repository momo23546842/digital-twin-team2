import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, message } = await request.json();

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Insert contact
    const result = await query(
      `INSERT INTO contacts (name, email, phone, company, message) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [name, email, phone || null, company || null, message || null]
    );

    return NextResponse.json({
      success: true,
      contactId: result.rows[0].id,
      message: 'Contact saved successfully',
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to save contact' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM contacts ORDER BY created_at DESC');
    return NextResponse.json({ contacts: result.rows });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
