import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Get recent chat history for a session
 */
export async function getRecentHistory(sessionId: string, limit: number = 10) {
  try {
    const history = await prisma.chatLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    return history;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  try {
    const message = await prisma.chatLog.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
    return message;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
}

/**
 * Save a lead to the database
 */
export async function saveLead(data: {
  name?: string;
  email: string;
  company?: string;
  source?: string;
}) {
  try {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company,
        source: data.source || "chat",
      },
    });
    return lead;
  } catch (error) {
    console.error("Error saving lead:", error);
    throw error;
  }
}

/**
 * Get all leads (for admin)
 */
export async function getLeads() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return leads;
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

/**
 * Save a document to the database
 */
export async function saveDocument(data: {
  userId: string;
  title?: string;
  content: string;
  source?: string;
}) {
  try {
    const document = await prisma.document.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        source: data.source || "uploaded",
      },
    });
    return document;
  } catch (error) {
    console.error("Error saving document:", error);
    throw error;
  }
}

/**
 * Get documents for a user
 */
export async function getDocuments(userId: string) {
  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

/**
 * Simple rate limiting using in-memory store (for development)
 * In production, consider using Redis or a proper rate limiter
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowSeconds: number = 60
): boolean {
  const now = Date.now();
  const key = `rate-limit:${userId}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowSeconds * 1000 });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
