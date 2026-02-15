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
    startedAt?: string;
    endedAt?: string;
  };
  message?: {
    role: string;
    content: string;
  };
  transcript?: string;
  artifact?: {
    messages?: Array<{
      role: string;
      content: string;
    }>;
    messagesOpenAIFormatted?: any[];
  };
  [key: string]: any;
}

// 通話履歴を保存する簡易データストア（本番環境ではデータベースを使用）
const callHistory: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Vapi webhook received');

    const body: VapiWebhookMessage = await request.json();
    
    console.log('📦 Webhook payload:', JSON.stringify(body, null, 2));
    
    // 通話IDを取得
    const callId = body.call?.id;
    
    switch (body.type) {
      case 'assistant-request':
        console.log('🤖 Assistant request received');
        
        // 通話開始時の情報を記録
        if (callId) {
          callHistory.set(callId, {
            callId,
            phoneNumber: body.call?.phoneNumber,
            customerNumber: body.call?.customer?.number,
            startedAt: new Date().toISOString(),
            transcripts: [],
            status: 'started'
          });
        }
        
        return NextResponse.json({
          assistant: {
            model: {
              provider: 'openai',
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: 'You are a friendly and helpful AI assistant for a digital twin platform. Be conversational, concise, and helpful. Answer questions about the platform and assist users.',
                },
              ],
              temperature: 0.7,
            },
            voice: {
              provider: 'playht',
              voiceId: 'jennifer',
            },
            firstMessage: 'Hi! This is your digital twin assistant. How can I help you today?',
            recordingEnabled: true,
            endCallMessage: 'Thank you for calling. Have a great day!',
            endCallPhrases: ['goodbye', 'bye', 'thanks bye', 'thank you goodbye'],
          },
        });

      case 'status-update':
        console.log(`📊 Status update: ${body.call?.status}`);
        
        // 通話状態を更新
        if (callId && callHistory.has(callId)) {
          const history = callHistory.get(callId);
          history.status = body.call?.status;
          callHistory.set(callId, history);
        }
        break;

      case 'transcript':
        console.log(`💬 Transcript: ${body.transcript}`);
        
        // トランスクリプトを記録
        if (callId && callHistory.has(callId)) {
          const history = callHistory.get(callId);
          history.transcripts.push({
            text: body.transcript,
            timestamp: new Date().toISOString()
          });
          callHistory.set(callId, history);
        }
        break;

      case 'end-of-call-report':
        console.log('📞 Call ended - Full Report');
        console.log('Call ID:', callId);
        
        if (callId) {
          // 通話終了時の完全な情報を記録
          const finalReport = {
            callId,
            phoneNumber: body.call?.phoneNumber,
            customerNumber: body.call?.customer?.number,
            startedAt: body.call?.startedAt,
            endedAt: body.call?.endedAt || new Date().toISOString(),
            messages: body.artifact?.messages || [],
            status: 'completed'
          };
          
          callHistory.set(callId, finalReport);
          
          // 通話の詳細をログに出力
          console.log('📋 Call Summary:');
          console.log(`  Duration: ${body.call?.startedAt} to ${body.call?.endedAt}`);
          console.log(`  Messages: ${body.artifact?.messages?.length || 0}`);
          console.log('  Conversation:');
          body.artifact?.messages?.forEach((msg: any, idx: number) => {
            console.log(`    ${idx + 1}. [${msg.role}]: ${msg.content}`);
          });
        }
        break;

      case 'function-call':
        console.log('⚡ Function call received');
        // カスタム関数呼び出しをここで処理
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

    return NextResponse.json({ 
      received: true,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json({ 
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}

// GET: 通話履歴を確認するエンドポイント
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callId = searchParams.get('callId');
  
  if (callId) {
    // 特定の通話の詳細を返す
    const history = callHistory.get(callId);
    if (history) {
      return NextResponse.json({
        success: true,
        data: history
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Call not found'
      }, { status: 404 });
    }
  }
  
  // すべての通話履歴を返す
  return NextResponse.json({ 
    message: 'Vapi webhook endpoint is active',
    timestamp: new Date().toISOString(),
    totalCalls: callHistory.size,
    recentCalls: Array.from(callHistory.values()).slice(-10)
  });
}
