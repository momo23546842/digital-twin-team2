/**
 * Environment Variable Validation
 * Validates that all required environment variables are set
 */

// Required environment variables
const requiredEnvVars = [
  // Core
  'DATABASE_URL',
  'GROQ_API_KEY',
  
  // ElevenLabs Voice AI
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID',
  
  // Vapi Phone AI
  'VAPI_API_KEY',
  'VAPI_PUBLIC_KEY',
  'VAPI_PHONE_NUMBER_ID',
  
  // Email (Resend)
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  
  // SMS (Twilio)
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  
  // Notifications
  'NOTIFICATION_EMAIL',
  'NOTIFICATION_PHONE',
  
  // Security
  'WEBHOOK_SECRET',
] as const;

// Optional environment variables (won't fail validation if missing)
const optionalEnvVars = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'UPSTASH_VECTOR_REST_URL',
  'UPSTASH_VECTOR_REST_TOKEN',
  'GITHUB_TOKEN',
  'NEXT_PUBLIC_APP_URL',
] as const;

/**
 * Validates environment variables
 * @throws Error if required variables are missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file.`
    );
  }
}

/**
 * Gets an environment variable with type safety
 * @throws Error if the variable is not set
 */
export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Gets an optional environment variable
 */
export function getOptionalEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Environment configuration object with type-safe access
 */
export const env = {
  // Core
  DATABASE_URL: getEnv('DATABASE_URL'),
  GROQ_API_KEY: getEnv('GROQ_API_KEY'),
  
  // ElevenLabs Voice AI
  ELEVENLABS_API_KEY: getEnv('ELEVENLABS_API_KEY'),
  ELEVENLABS_VOICE_ID: getEnv('ELEVENLABS_VOICE_ID'),
  
  // Vapi Phone AI
  VAPI_API_KEY: getEnv('VAPI_API_KEY'),
  VAPI_PUBLIC_KEY: getEnv('VAPI_PUBLIC_KEY'),
  VAPI_PHONE_NUMBER_ID: getEnv('VAPI_PHONE_NUMBER_ID'),
  
  // Email (Resend)
  RESEND_API_KEY: getEnv('RESEND_API_KEY'),
  RESEND_FROM_EMAIL: getEnv('RESEND_FROM_EMAIL'),
  
  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: getEnv('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: getEnv('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: getEnv('TWILIO_PHONE_NUMBER'),
  
  // Notifications
  NOTIFICATION_EMAIL: getEnv('NOTIFICATION_EMAIL'),
  NOTIFICATION_PHONE: getEnv('NOTIFICATION_PHONE'),
  
  // Security
  WEBHOOK_SECRET: getEnv('WEBHOOK_SECRET'),
  
  // Optional
  UPSTASH_REDIS_REST_URL: getOptionalEnv('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: getOptionalEnv('UPSTASH_REDIS_REST_TOKEN'),
  UPSTASH_VECTOR_REST_URL: getOptionalEnv('UPSTASH_VECTOR_REST_URL'),
  UPSTASH_VECTOR_REST_TOKEN: getOptionalEnv('UPSTASH_VECTOR_REST_TOKEN'),
  GITHUB_TOKEN: getOptionalEnv('GITHUB_TOKEN'),
  NEXT_PUBLIC_APP_URL: getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
} as const;

// Validate environment on module load (server-side only)
if (typeof window === 'undefined') {
  validateEnv();
}
