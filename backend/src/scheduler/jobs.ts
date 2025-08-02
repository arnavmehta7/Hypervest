import Queue from 'bull';
import { config } from '../config/env';
import { prisma } from '../database/connection';
import { DCAStrategy } from '../strategies/DCAStrategy';
import { logger } from '../utils/logger';

// Create job queues
export const strategyQueue = new Queue('strategy execution', config.REDIS_URL);

const dcaStrategy = new DCAStrategy();

// Process strategy execution jobs
strategyQueue.process('execute-strategy', async (job) => {
  const { strategyId, strategyType } = job.data;
  
  try {
    logger.info(`Processing strategy execution job: ${strategyId}`);
    
    if (strategyType === 'DCA') {
      await dcaStrategy.executeStrategy(strategyId);
    } else {
      throw new Error(`Unsupported strategy type: ${strategyType}`);
    }
    
    logger.info(`Strategy execution completed: ${strategyId}`);
  } catch (error) {
    logger.error(`Strategy execution failed: ${strategyId}`, error);
    throw error; // This will mark the job as failed
  }
});

// Schedule strategy executions
export async function scheduleStrategyExecutions() {
  try {
    const activeStrategies = await prisma.strategy.findMany({
      where: { 
        status: 'ACTIVE',
        nextExecution: {
          lte: new Date(),
        },
      },
    });

    logger.info(`Found ${activeStrategies.length} strategies ready for execution`);

    for (const strategy of activeStrategies) {
      // Check if there's already a pending job for this strategy
      const existingJobs = await strategyQueue.getJobs(['waiting', 'active'], 0, 10);
      const hasExistingJob = existingJobs.some(job => 
        job.data.strategyId === strategy.id && 
        job.data.strategyType === strategy.type
      );

      if (!hasExistingJob) {
        // Add job to queue with delay for immediate execution
        await strategyQueue.add('execute-strategy', {
          strategyId: strategy.id,
          strategyType: strategy.type,
        }, {
          attempts: 3, // Retry failed jobs up to 3 times
          backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2 second delay
          },
          removeOnComplete: 10, // Keep only last 10 completed jobs
          removeOnFail: 5, // Keep only last 5 failed jobs
        });

        logger.info(`Scheduled execution for strategy: ${strategy.id} (${strategy.type})`);
      } else {
        logger.info(`Strategy ${strategy.id} already has a pending job, skipping`);
      }
    }

    logger.info(`Scheduled ${activeStrategies.length} strategy executions`);
  } catch (error) {
    logger.error('Error scheduling strategy executions:', error);
  }
}

// Monitor strategy schedules (run every 30 seconds)
export function startStrategyMonitor() {
  logger.info('🕐 Starting strategy monitor - checking every 30 seconds');
  
  // Run once immediately
  scheduleStrategyExecutions();
  
  // Then run every 30 seconds
  setInterval(scheduleStrategyExecutions, 30 * 1000);
  
  logger.info('✅ Strategy monitor started successfully');
}

// Job event handlers for monitoring
strategyQueue.on('completed', (job, result) => {
  logger.info(`Job completed: ${job.id}`, { strategyId: job.data.strategyId });
});

strategyQueue.on('failed', (job, err) => {
  logger.error(`Job failed: ${job.id}`, { 
    strategyId: job.data.strategyId, 
    error: err.message 
  });
});

strategyQueue.on('stalled', (job) => {
  logger.warn(`Job stalled: ${job.id}`, { strategyId: job.data.strategyId });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Closing strategy queue...');
  await strategyQueue.close();
});

process.on('SIGINT', async () => {
  logger.info('Closing strategy queue...');
  await strategyQueue.close();
}); 