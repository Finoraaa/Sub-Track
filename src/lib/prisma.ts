import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Database features will be disabled.');
    // Return a proxy that throws descriptive errors instead of crashing the whole app
    return new Proxy({} as PrismaClient, {
      get: () => {
        throw new Error('Database connection is not configured. Please set DATABASE_URL in your environment.');
      }
    });
  }
  return new PrismaClient({
    log: ['query'],
  });
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
