import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('CRITICAL: DATABASE_URL environment variable is missing.');
    
    // Recursive proxy to handle nested property access like prisma.user.findFirst()
    const createErrorProxy = (path: string[] = []): any => {
      const errorHandler = () => {
        throw new Error(`Database connection is not configured. Please set DATABASE_URL in your environment variables. (Accessing: prisma.${path.join('.')})`);
      };

      return new Proxy(errorHandler, {
        get: (target, prop) => {
          if (typeof prop === 'string') {
            return createErrorProxy([...path, prop]);
          }
          return target;
        },
        apply: (target) => {
          return errorHandler();
        }
      });
    };

    return createErrorProxy() as PrismaClient;
  }
  
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
