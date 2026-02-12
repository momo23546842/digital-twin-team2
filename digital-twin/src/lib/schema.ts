import { getPool, ensureInitialized } from "./postgres";

/**
 * Create all necessary database tables for production
 * Run this on app startup
 */
export async function initializeSchema() {
  const client = await getPool().connect();
  try {
    // Users table - for authentication (optional if using external auth)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Admin Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // Conversations table - stores entire chat sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        session_id TEXT,
        title TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        summary TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Messages table - individual messages in conversations
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        voice_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Contacts table - for lead capture
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        title TEXT,
        message TEXT,
        source TEXT DEFAULT 'chat',
        status TEXT DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Meetings table - for booking meetings
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        zoom_url TEXT,
        calendar_event_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Voice recordings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS voice_recordings (
        id TEXT PRIMARY KEY,
        message_id TEXT REFERENCES messages(id) ON DELETE CASCADE,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        audio_url TEXT NOT NULL,
        duration_seconds FLOAT,
        transcription TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Analytics table - for tracking interactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        conversation_id TEXT REFERENCES conversations(id),
        event_type TEXT NOT NULL,
        event_data JSONB,
        user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS conversations_user_id_idx 
      ON conversations(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS conversations_session_id_idx 
      ON conversations(session_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS messages_conversation_id_idx 
      ON messages(conversation_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS contacts_email_idx 
      ON contacts(email);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS contacts_created_at_idx 
      ON contacts(created_at DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS meetings_scheduled_at_idx 
      ON meetings(scheduled_at);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS voice_recordings_conversation_id_idx 
      ON voice_recordings(conversation_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS analytics_created_at_idx 
      ON analytics(created_at DESC);
    `);

    console.log("✅ Database schema initialized successfully");
  } catch (error) {
    console.error("❌ Schema initialization error:", error);
    throw error;
  } finally {
    client.release();
  }
}
