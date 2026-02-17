/**
 * Database Service Functions
 * High-level database operations for conversations, messages, contacts, and meetings
 */

import { getPool, ensureInitialized } from "./postgres";
import type {
  Conversation,
  Message,
  Contact,
  Meeting,
  VoiceRecording,
} from "@/types";

// ========================================
// CONVERSATION OPERATIONS
// ========================================

export async function createConversation(
  sessionId: string,
  userId?: string,
  title?: string
): Promise<Conversation> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const result = await client.query(
      `INSERT INTO conversations (id, session_id, user_id, title)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, sessionId, userId || null, title || null]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getConversation(id: string): Promise<Conversation | null> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const result = await client.query(
      "SELECT * FROM conversations WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function listConversations(
  userId?: string,
  limit = 50,
  offset = 0
): Promise<Conversation[]> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const query = userId
      ? "SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
      : "SELECT * FROM conversations ORDER BY created_at DESC LIMIT $1 OFFSET $2";

    const params = userId ? [userId, limit, offset] : [limit, offset];
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function updateConversation(
  id: string,
  updates: Partial<Conversation>
): Promise<Conversation> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE conversations SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $${paramCount} RETURNING *`;

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// ========================================
// MESSAGE OPERATIONS
// ========================================

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  voiceUrl?: string
): Promise<Message> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const result = await client.query(
      `INSERT INTO messages (id, conversation_id, role, content, voice_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, conversationId, role, content, voiceUrl || null]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const result = await client.query(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// ========================================
// CONTACT OPERATIONS
// ========================================

export async function createContact(
  contactData: Partial<Contact>
): Promise<Contact> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const id = `contact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const {
      email,
      name,
      phone,
      company,
      title,
      message,
      source,
      conversation_id,
    } = contactData;

    const result = await client.query(
      `INSERT INTO contacts (id, email, name, phone, company, title, message, source, conversation_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        email,
        name,
        phone || null,
        company || null,
        title || null,
        message || null,
        source || "chat",
        conversation_id || null,
      ]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getContact(id: string): Promise<Contact | null> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const result = await client.query(
      "SELECT * FROM contacts WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function listContacts(
  limit = 50,
  offset = 0,
  status?: string
): Promise<{ contacts: Contact[]; total: number }> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const query = status
      ? "SELECT * FROM contacts WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
      : "SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2";

    const params = status ? [status, limit, offset] : [limit, offset];
    const result = await client.query(query, params);

    const countQuery = status
      ? "SELECT COUNT(*) as count FROM contacts WHERE status = $1"
      : "SELECT COUNT(*) as count FROM contacts";

    const countParams = status ? [status] : [];
    const countResult = await client.query(countQuery, countParams);

    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  } finally {
    client.release();
  }
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>
): Promise<Contact> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE contacts SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $${paramCount} RETURNING *`;

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// ========================================
// MEETING OPERATIONS
// ========================================

export async function createMeeting(
  meetingData: Partial<Meeting>
): Promise<Meeting> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const id = `meet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const { contact_id, scheduled_at, duration_minutes = 30, notes } =
      meetingData;

    const result = await client.query(
      `INSERT INTO meetings (id, contact_id, scheduled_at, duration_minutes, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, contact_id, scheduled_at, duration_minutes, notes || null]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getMeeting(id: string): Promise<Meeting | null> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const result = await client.query(
      "SELECT * FROM meetings WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function listMeetings(
  limit = 50,
  offset = 0,
  status?: string
): Promise<{ meetings: Meeting[]; total: number }> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const query = status
      ? "SELECT * FROM meetings WHERE status = $1 ORDER BY scheduled_at ASC LIMIT $2 OFFSET $3"
      : "SELECT * FROM meetings ORDER BY scheduled_at ASC LIMIT $1 OFFSET $2";

    const params = status ? [status, limit, offset] : [limit, offset];
    const result = await client.query(query, params);

    const countQuery = status
      ? "SELECT COUNT(*) as count FROM meetings WHERE status = $1"
      : "SELECT COUNT(*) as count FROM meetings";

    const countParams = status ? [status] : [];
    const countResult = await client.query(countQuery, countParams);

    return {
      meetings: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  } finally {
    client.release();
  }
}

export async function updateMeeting(
  id: string,
  updates: Partial<Meeting>
): Promise<Meeting> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at") {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(id);
    const query = `UPDATE meetings SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $${paramCount} RETURNING *`;

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// ========================================
// ANALYTICS
// ========================================

export async function trackEvent(
  eventType: string,
  conversationId?: string,
  userId?: string,
  eventData?: Record<string, any>
): Promise<void> {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const id = `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await client.query(
      `INSERT INTO analytics (id, event_type, conversation_id, user_id, event_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, eventType, conversationId || null, userId || null, JSON.stringify(eventData || {})]
    );
  } finally {
    client.release();
  }
}

// ========================================
// DASHBOARD STATS
// ========================================

export async function getDashboardStats() {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    const today = new Date().toISOString().split("T")[0];

    const results = await Promise.all([
      client.query("SELECT COUNT(*) as count FROM conversations"),
      client.query("SELECT COUNT(*) as count FROM contacts"),
      client.query("SELECT COUNT(*) as count FROM meetings"),
      client.query(
        `SELECT COUNT(*) as count FROM conversations WHERE DATE(created_at) = $1`,
        [today]
      ),
      client.query(
        `SELECT COUNT(*) as count FROM contacts WHERE DATE(created_at) = $1`,
        [today]
      ),
      client.query(
        `SELECT COUNT(*) as count FROM meetings WHERE status = 'scheduled' AND DATE(scheduled_at) >= $1`,
        [today]
      ),
    ]);

    return {
      total_conversations: parseInt(results[0].rows[0].count, 10),
      total_contacts: parseInt(results[1].rows[0].count, 10),
      total_meetings: parseInt(results[2].rows[0].count, 10),
      conversations_today: parseInt(results[3].rows[0].count, 10),
      new_contacts_today: parseInt(results[4].rows[0].count, 10),
      pending_meetings: parseInt(results[5].rows[0].count, 10),
    };
  } finally {
    client.release();
  }
}
