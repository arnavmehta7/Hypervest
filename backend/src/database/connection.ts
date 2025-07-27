import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';


export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database Query:', {
      query: e.query,
      params: e.params,
      duration: e.duration,
    });
  }
});

prisma.$on('error', (e) => {
  logger.error('Database Error:', e);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 