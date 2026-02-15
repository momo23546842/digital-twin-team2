// app/api/vapi/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Types for Vapi webhook events
interface VapiWebhookMessage {
  type: string;
  call?: {
    id: string;
    status?: string;
    phoneNumber?: string;
    customer?: {
      number?: string;
    };
  };
  message?: {
    role: string;
    content: string;
  };
  transcript?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    // Log that webhook was received
    console.log('🔔 Vapi webhook received');

    // Parse the JSON body
    const body: VapiWebhookMessage = await request.json();
    
    console.log('📦 Webhook payload:', JSON.stringify(body, null, 2));
    
    // Handle different webhook event types
    switch (body.type) {
      case 'assistant-request':
        console.log('🤖 Assistant request received');
        // Return assistant configuration
        return NextResponse.json({
          assistant: {
            model: {
              provider: 'openai',
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful assistant. Be concise and friendly.',
                },
              ],
            },
            voice: {
              provider: 'playht',
              voiceId: 'jennifer',
            },
            firstMessage: 'Hello! How can I help you today?',
          },
        });

      case 'status-update':
        console.log(`📊 Status update: ${body.call?.status}`);
        break;

      case 'function-call':
        console.log('⚡ Function call received');
        // Handle custom function calls here
        break;

      case 'transcript':
        console.log(`💬 Transcript: ${body.transcript}`);
        break;

      case 'end-of-call-report':
        console.log('📞 Call ended');
        console.log('Call ID:', body.call?.id);
        break;

      case 'speech-update':
        console.log('🗣️ Speech update');
        break;

      case 'hang':
        console.log('📴 Call hung up');
        break;

      default:
        console.log(`❓ Unknown event type: ${body.type}`);
    }

    // Always return 200 OK for webhook acknowledgment
    return NextResponse.json({ 
      received: true,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    // Detailed error logging
    console.error('❌ Webhook error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Return 200 even on error to prevent Vapi from retrying
    // Log the error for debugging but don't fail the webhook
    return NextResponse.json({ 
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Vapi webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
