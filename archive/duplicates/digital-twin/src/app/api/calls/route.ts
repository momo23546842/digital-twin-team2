import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateAssistant, makeOutboundCall, getCallDetails } from '@/lib/vapi';

/**
 * POST /api/calls
 * Initiate an outbound phone call via Vapi
 *
 * Body: { phoneNumber: string } — E.164 format, e.g. "+14155551234"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: 'phoneNumber is required (E.164 format, e.g. +14155551234)' },
        { status: 400 },
      );
    }

    // Basic E.164 validation
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 format (e.g. +14155551234)' },
        { status: 400 },
      );
    }

    // 1. Get or create the Vapi assistant
    const assistant = await getOrCreateAssistant();

    // 2. Make the outbound call
    const call = await makeOutboundCall(assistant.id, phoneNumber);

    const callId = 'id' in call ? call.id : undefined;

    return NextResponse.json(
      {
        success: true,
        callId,
        message: `Call initiated to ${phoneNumber}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[api/calls] Error initiating call:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate call',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/calls?callId=xxx
 * Get call details / status
 */
export async function GET(request: NextRequest) {
  const callId = request.nextUrl.searchParams.get('callId');

  if (!callId) {
    return NextResponse.json(
      { error: 'callId query parameter is required' },
      { status: 400 },
    );
  }

  try {
    const details = await getCallDetails(callId);
    return NextResponse.json(details);
  } catch (error) {
    console.error('[api/calls] Error fetching call:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call details' },
      { status: 500 },
    );
  }
}
