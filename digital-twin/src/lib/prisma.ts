/**
 * Prisma-compatible database client
 * This provides a Prisma-like interface while using the raw PostgreSQL connection
 */

import { getPool, ensureInitialized } from "./postgres";

// Define the phoneCall operations
const phoneCall = {
  async create(options: {
    data: {
      callId: string;
      callerNumber: string;
      status: string;
      startedAt: Date;
      endedAt?: Date | null;
      duration?: number | null;
      recordingUrl?: string | null;
      transcript?: string | null;
      summary?: string | null;
    };
  }) {
    await ensureInitialized();
    const client = await getPool().connect();
    try {
      const id = `call-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const result = await client.query(
        `INSERT INTO phone_calls (
          id, call_id, caller_number, status, started_at, ended_at, 
          duration, recording_url, transcript, summary
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          options.data.callId,
          options.data.callerNumber,
          options.data.status,
          options.data.startedAt,
          options.data.endedAt || null,
          options.data.duration || null,
          options.data.recordingUrl || null,
          options.data.transcript || null,
          options.data.summary || null,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async update(options: {
    where: { callId: string };
    data: {
      status?: string;
      endedAt?: Date;
      duration?: number | null;
      recordingUrl?: string | null;
      transcript?: string | null;
      summary?: string | null;
    };
  }) {
    await ensureInitialized();
    const client = await getPool().connect();
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (options.data.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(options.data.status);
      }
      if (options.data.endedAt !== undefined) {
        updates.push(`ended_at = $${paramIndex++}`);
        values.push(options.data.endedAt);
      }
      if (options.data.duration !== undefined) {
        updates.push(`duration = $${paramIndex++}`);
        values.push(options.data.duration);
      }
      if (options.data.recordingUrl !== undefined) {
        updates.push(`recording_url = $${paramIndex++}`);
        values.push(options.data.recordingUrl);
      }
      if (options.data.transcript !== undefined) {
        updates.push(`transcript = $${paramIndex++}`);
        values.push(options.data.transcript);
      }
      if (options.data.summary !== undefined) {
        updates.push(`summary = $${paramIndex++}`);
        values.push(options.data.summary);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(options.where.callId);

      const result = await client.query(
        `UPDATE phone_calls 
         SET ${updates.join(", ")}
         WHERE call_id = $${paramIndex}
         RETURNING *`,
        values
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async findMany(options?: {
    orderBy?: { createdAt?: "asc" | "desc" };
    take?: number;
    select?: {
      id?: boolean;
      callId?: boolean;
      callerNumber?: boolean;
      status?: boolean;
      startedAt?: boolean;
      endedAt?: boolean;
      duration?: boolean;
      recordingUrl?: boolean;
      summary?: boolean;
    };
  }) {
    await ensureInitialized();
    const client = await getPool().connect();
    try {
      let query = "SELECT ";
      
      if (options?.select) {
        const fields: string[] = [];
        if (options.select.id) fields.push("id");
        if (options.select.callId) fields.push("call_id as \"callId\"");
        if (options.select.callerNumber) fields.push("caller_number as \"callerNumber\"");
        if (options.select.status) fields.push("status");
        if (options.select.startedAt) fields.push("started_at as \"startedAt\"");
        if (options.select.endedAt) fields.push("ended_at as \"endedAt\"");
        if (options.select.duration) fields.push("duration");
        if (options.select.recordingUrl) fields.push("recording_url as \"recordingUrl\"");
        if (options.select.summary) fields.push("summary");
        query += fields.join(", ");
      } else {
        query += "*";
      }
      
      query += " FROM phone_calls";

      if (options?.orderBy?.createdAt) {
        query += ` ORDER BY created_at ${options.orderBy.createdAt}`;
      }

      if (options?.take) {
        query += ` LIMIT ${options.take}`;
      }

      const result = await client.query(query);
      return result.rows;
    } finally {
      client.release();
    }
  },
};

// Export a prisma-like client
export const prisma = {
  phoneCall,
};
