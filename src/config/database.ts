import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query' as any, (e: any) => {
  if (process.env.DEBUG_PRISMA === 'true') {
    logger.debug(`Query: ${e.query} -- Duration: ${e.duration}ms`);
  }
});
