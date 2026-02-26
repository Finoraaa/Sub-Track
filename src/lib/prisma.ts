import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.error('CRITICAL: DATABASE_URL environment variable is missing.');
    return new Proxy({} as PrismaClient, {
      get: (_, prop) => {
        return () => {
          throw new Error(`Database connection is not configured. Please set DATABASE_URL in your environment variables. (Accessing: ${String(prop)})`);
        };
      }
    });
  }
  
  const client = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: url.includes('sslmode=') ? url : `${url}${url.includes('?') ? '&' : '?'}sslmode=require`
      }
    }
  });

  // Test connection and log status
  client.$connect()
    .then(() => console.log('Successfully connected to Neon Tech Database'))
    .catch((err) => console.error('Failed to connect to Neon Tech Database:', err.message));

  return client;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
