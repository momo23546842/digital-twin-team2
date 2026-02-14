/**
 * Vapi AI Phone Integration
 * Handles AI phone assistant creation and management
 */

import { VapiClient } from '@vapi-ai/server-sdk';

// Lazy-initialize Vapi client to ensure env vars are loaded
let vapi: VapiClient | null = null;

function getVapiClient(): VapiClient {
  if (!vapi) {
    const token = process.env.VAPI_API_KEY;
    if (!token) {
      throw new Error('VAPI_API_KEY environment variable is required');
    }
    vapi = new VapiClient({ token });
  }
  return vapi;
}

// Configuration constants
const ASSISTANT_NAME = 'Digital Twin Assistant';
const FIRST_MESSAGE = "Hello, this is an AI assistant representing [NAME]. I'm not [NAME] in person, but I'm designed to answer questions on their behalf.";
const SYSTEM_PROMPT = `You are a professional digital twin AI assistant. Your role is to represent your creator and answer questions about their background, skills, experience, and expertise.

Be conversational, professional, and helpful. When asked about specific experience or projects, provide detailed but concise answers. If you don't know something, be honest about it.

Remember to:
- Speak naturally and conversationally
- Be accurate about facts and experiences
- Maintain a professional yet friendly tone
- Keep responses focused and relevant`;

/**
 * Gets existing assistant or creates a new one
 * @returns Assistant object with ID and configuration
 */
export async function getOrCreateAssistant() {
  try {
    const vapi = getVapiClient();
    // Try to find existing assistant
    const assistants = await vapi.assistants.list();
    const existingAssistant = assistants.find(
      (a: any) => a.name === ASSISTANT_NAME
    );

    if (existingAssistant) {
      console.log('Using existing assistant:', existingAssistant.id);
      return existingAssistant;
    }

    // Create new assistant
    console.log('Creating new Vapi assistant...');
    const assistant = await vapi.assistants.create({
      name: ASSISTANT_NAME,
      
      // First message when call connects
      firstMessage: FIRST_MESSAGE,
      
      // Model configuration - use Groq LLM
      model: {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
        ],
      },
      
      // Voice configuration - use ElevenLabs
      voice: {
        provider: '11labs',
        voiceId: process.env.ELEVENLABS_VOICE_ID!,
        stability: 0.5,
        similarityBoost: 0.75,
      },
      
      // Webhook URL for call events
      server: {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/vapi`,
      },
      
      // Additional settings
      endCallMessage: 'Thank you for calling. Have a great day!',
      endCallPhrases: ['goodbye', 'bye', 'that\'s all', 'thank you'],
      
      // Transcription settings
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en-US',
      },
    });

    console.log('Assistant created successfully:', assistant.id);
    return assistant;
  } catch (error) {
    console.error('Error creating/fetching assistant:', error);
    throw error;
  }
}

/**
 * Gets existing phone number or purchases a new one and assigns it to assistant
 * @param assistantId - The assistant ID to assign the phone number to
 * @returns Phone number object
 */
export async function getOrPurchasePhoneNumber(assistantId: string) {
  try {
    const vapi = getVapiClient();
    // Check if we already have a phone number configured
    const configuredNumber = process.env.VAPI_PHONE_NUMBER_ID;
    if (configuredNumber) {
      console.log('Using configured phone number:', configuredNumber);
      
      // Get phone number details
      const phoneNumber = await vapi.phoneNumbers.get({
        id: configuredNumber,
      });
      
      // Update to assign to assistant if not already assigned
      if (phoneNumber.assistantId !== assistantId) {
        await vapi.phoneNumbers.update({
          id: configuredNumber,
          body: {
            assistantId,
          },
        });
        console.log('Phone number updated with assistant ID');
      }
      
      return phoneNumber;
    }

    // Try to find existing unassigned phone number
    const phoneNumbers = await vapi.phoneNumbers.list();
    const unassignedNumber = phoneNumbers.find(
      (num: any) => !num.assistantId
    );

    if (unassignedNumber) {
      console.log('Found unassigned phone number:', unassignedNumber.id);
      await vapi.phoneNumbers.update({
        id: unassignedNumber.id,
        body: {
          assistantId,
        },
      });
      return unassignedNumber;
    }

    // Purchase new phone number (free US number)
    console.log('Purchasing new phone number...');
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      throw new Error('TWILIO_PHONE_NUMBER environment variable is required');
    }

    const phoneNumber = await vapi.phoneNumbers.create({
      provider: 'twilio',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
      number: twilioPhoneNumber,
      assistantId,
      name: 'Digital Twin Phone Line',
    });

    console.log('Phone number purchased and assigned:', phoneNumber.number);
    return phoneNumber;
  } catch (error) {
    console.error('Error getting/purchasing phone number:', error);
    throw error;
  }
}

/**
 * Gets call details including transcript and recording
 * @param callId - The call ID to fetch details for
 * @returns Call object with transcript and recording URL
 */
export async function getCallDetails(callId: string) {
  try {
    const vapi = getVapiClient();
    console.log('Fetching call details for:', callId);
    
    const call = await vapi.calls.get({
      id: callId,
    });
    
    return {
      id: call.id,
      status: call.status,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      duration: call.endedAt && call.startedAt 
        ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
        : null,
      messages: call.messages,
      phoneNumber: call.customer?.number,
      cost: call.cost,
    };
  } catch (error) {
    console.error('Error fetching call details:', error);
    throw error;
  }
}

/**
 * Make an outbound call
 * @param assistantId - The assistant to use for the call
 * @param phoneNumber - The phone number to call (E.164 format)
 * @returns Call object
 */
export async function makeOutboundCall(
  assistantId: string,
  phoneNumber: string
) {
  try {
    const vapi = getVapiClient();
    console.log('Making outbound call to:', phoneNumber);
    
    const call = await vapi.calls.create({
      assistantId,
      customer: {
        number: phoneNumber,
      },
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    });

    const callId = 'id' in call ? call.id : call.results[0]?.id;
    console.log('Outbound call initiated:', callId ?? 'unknown');
    return call;
  } catch (error) {
    console.error('Error making outbound call:', error);
    throw error;
  }
}

/**
 * End an active call
 * @param callId - The call ID to end
 */
export async function endCall(callId: string) {
  try {
    const vapi = getVapiClient();
    console.log('Ending call:', callId);
    await vapi.calls.delete({
      id: callId,
    });
    console.log('Call ended successfully');
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
}
