-- Migration: Add voice tracking columns to messages table
-- Date: 2026-02-10
-- Description: Adds input_method and voice_transcript columns to track voice interactions

-- Add input_method column to track how message was sent (text or voice)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS input_method VARCHAR(10) DEFAULT 'text';

-- Add voice_transcript column to store original voice transcription
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS voice_transcript TEXT;

-- Create index for filtering by input method
CREATE INDEX IF NOT EXISTS messages_input_method_idx ON messages(input_method);

-- Add comment for documentation
COMMENT ON COLUMN messages.input_method IS 'How the message was input: text or voice';
COMMENT ON COLUMN messages.voice_transcript IS 'Original voice transcription before processing';

-- You can run this migration manually or it will be applied automatically when the app starts
