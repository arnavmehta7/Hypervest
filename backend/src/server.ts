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
import axios from 'axios';

// Import routes
import authRoutes from './routes/auth';
import strategyRoutes from './routes/strategies';
import walletRoutes from './routes/wallet';
import marketRoutes from './routes/market';

// Import scheduler
import { startStrategyMonitor } from './scheduler/jobs';

const app = express();

// Trust proxy for accurate IP detection behind load balancers/proxies
// app.set('trust proxy', true);

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

// Scheduler status endpoint
app.get('/api/scheduler/status', async (req, res) => {
  try {
    const { strategyQueue } = await import('./scheduler/jobs');
    
    // Get active strategies that should be scheduled
    const activeStrategies = await prisma.strategy.findMany({
      where: { 
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        type: true,
        nextExecution: true,
        status: true,
      },
    });

    // Get queue stats
    const waiting = await strategyQueue.getWaiting();
    const active = await strategyQueue.getActive();
    const completed = await strategyQueue.getCompleted();
    const failed = await strategyQueue.getFailed();

    const strategiesDue = activeStrategies.filter(s => 
      s.nextExecution && s.nextExecution <= new Date()
    );

    res.json({
      scheduler: {
        status: 'running',
        timestamp: new Date().toISOString(),
      },
      strategies: {
        total: activeStrategies.length,
        due: strategiesDue.length,
        list: strategiesDue,
      },
      queue: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      },
    });
  } catch (error) {
    logger.error('Scheduler status check failed:', error);
    res.status(500).json({
      error: 'Failed to get scheduler status',
      timestamp: new Date().toISOString(),
    });
  }
});

// Manual scheduler trigger (for testing)
app.post('/api/scheduler/trigger', async (req, res) => {
  try {
    const { scheduleStrategyExecutions } = await import('./scheduler/jobs');
    
    logger.info('Manual scheduler trigger requested');
    await scheduleStrategyExecutions();
    
    res.json({
      message: 'Scheduler triggered successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Manual scheduler trigger failed:', error);
    res.status(500).json({
      error: 'Failed to trigger scheduler',
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug cron parsing endpoint
app.get('/api/debug/cron/:frequency', async (req, res) => {
  try {
    const cronParser = require('cron-parser');
    const frequency = decodeURIComponent(req.params.frequency);
    
    logger.info(`Testing cron expression: ${frequency}`);
    
    const currentTime = new Date();
    const interval = cronParser.parseExpression(frequency, {
      currentDate: currentTime,
      tz: 'UTC'
    });
    
    const next1 = interval.next().toDate();
    const next2 = interval.next().toDate();
    const next3 = interval.next().toDate();
    
    // Reset and test with different current times
    const testTime1 = new Date('2025-08-02T21:41:43.969Z'); // Last execution time from your data
    const interval2 = cronParser.parseExpression(frequency, {
      currentDate: testTime1,
      tz: 'UTC'
    });
    const nextFromLastExecution = interval2.next().toDate();
    
    res.json({
      frequency,
      currentTime: currentTime.toISOString(),
      next3Executions: [
        next1.toISOString(),
        next2.toISOString(), 
        next3.toISOString()
      ],
      testFromLastExecution: {
        fromTime: testTime1.toISOString(),
        nextExecution: nextFromLastExecution.toISOString(),
        minutesDifference: Math.round((nextFromLastExecution.getTime() - testTime1.getTime()) / (1000 * 60))
      }
    });
  } catch (error) {
    logger.error('Cron parsing debug failed:', error);
    res.status(500).json({
      error: 'Failed to parse cron expression',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/market', marketRoutes);

app.post('/api/balances', async (req, res) => {
  // get the tokens from body
  const tokens = req.body.tokens;
  const walletAddress = req.body.walletAddress;
  logger.info(`Fetching balances for tokens: ${tokens} for wallet: ${walletAddress}`);

  const url = `https://api.1inch.dev/balance/v1.2/42161/balances/${walletAddress}`;
  const config = {
    headers: {
      Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
    },
    params: {},
    paramsSerializer: {
      indexes: null,
    },
  };
  const body = {
    tokens: tokens,
  };

  try {
    const response = await axios.post(url, body, config);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

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

    // Start strategy monitor for automated DCA execution
    startStrategyMonitor();
    logger.info('Strategy monitor initialized');

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