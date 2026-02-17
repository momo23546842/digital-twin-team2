import { PrismaClient } from '@prisma/client';

// PrismaClient singleton for the application
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('DATABASE_URL not set - Prisma will not be initialized');
    return null;
  }

  try {
    // Create PrismaClient without adapter (simpler setup)
    return new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
      log: process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
