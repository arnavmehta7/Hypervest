import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { logger } from './utils/logger';
import { 
  helmetConfig, 
  corsOptions, 
  apiRateLimiter, 
  sanitizeInput 
} from './middleware/security';
import { prisma } from './database/connection';

// Import routes
import authRoutes from './routes/auth';
import strategyRoutes from './routes/strategies';
import walletRoutes from './routes/wallet';
import marketRoutes from './routes/market';

const app = express();

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(apiRateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/market', marketRoutes);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

const PORT = config.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Hypervest API server running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.NODE_ENV}`);
      logger.info(`🔐 Chain ID: ${config.CHAIN_ID}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer(); 