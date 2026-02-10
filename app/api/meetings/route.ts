import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { contactId, scheduledAt, durationMinutes = 30, meetingLink } = await request.json();

    if (!contactId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Contact ID and scheduled time are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO meetings (contact_id, scheduled_at, duration_minutes, meeting_link, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [contactId, new Date(scheduledAt), durationMinutes, meetingLink || null, 'pending']
    );

    return NextResponse.json({
      success: true,
      meetingId: result.rows[0].id,
      message: 'Meeting scheduled successfully',
    });
  } catch (error) {
    console.error('Meeting API error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule meeting' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT m.*, c.name, c.email 
       FROM meetings m 
       JOIN contacts c ON m.contact_id = c.id 
       ORDER BY m.scheduled_at DESC`
    );
    return NextResponse.json({ meetings: result.rows });
  } catch (error) {
    console.error('Get meetings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
