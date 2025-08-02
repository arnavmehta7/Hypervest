import express, { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../database/connection';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { tradingRateLimiter } from '../middleware/security';
import { DCAStrategy, DCAParameters } from '../strategies/DCAStrategy';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

const router: express.Router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Apply trading rate limiting
router.use(tradingRateLimiter);

const dcaStrategy = new DCAStrategy();

// Get all user strategies
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const strategies = await prisma.strategy.findMany({
      where: { userId: req.user!.id },
      include: {
        executions: {
          select: {
            id: true,
            status: true,
            fromAmount: true,
            toAmount: true,
            txHash: true,
            executedAt: true,
            error: true,
          },
          orderBy: { executedAt: 'desc' },
          take: 10, // Latest 10 executions
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ strategies });
  } catch (error) {
    logger.error('Error fetching strategies:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific strategy
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid strategy ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const strategy = await prisma.strategy.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    return res.json({ strategy });
  } catch (error) {
    logger.error('Error fetching strategy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions for a specific strategy execution
router.get('/executions/:executionId/transactions', [
  param('executionId').isUUID().withMessage('Invalid execution ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    // First verify the execution belongs to the user
    const execution = await prisma.strategyExecution.findFirst({
      where: {
        id: req.params.executionId,
        strategy: {
          userId: req.user!.id,
        },
      },
      include: {
        strategy: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Get all transactions for this user that might be related to this execution
    // For DCA, we look for transactions around the execution time
    const executionTime = execution.executedAt;
    const timeRange = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    const relatedTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        type: 'STRATEGY_EXECUTION',
        createdAt: {
          gte: new Date(executionTime.getTime() - timeRange),
          lte: new Date(executionTime.getTime() + timeRange),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Also include the main transaction hash from the execution
    const mainTransaction = execution.txHash ? {
      id: 'main',
      txHash: execution.txHash,
      type: 'SWAP',
      fromToken: execution.fromToken,
      toToken: execution.toToken,
      fromAmount: execution.fromAmount,
      toAmount: execution.toAmount,
      url: `https://arbiscan.io/tx/${execution.txHash}`,
      timestamp: execution.executedAt,
    } : null;

    const formattedTransactions = relatedTransactions.map(tx => ({
      id: tx.id,
      txHash: tx.txHash,
      type: tx.fromToken === tx.toToken ? 'TRANSFER' : 'SWAP',
      fromToken: tx.fromToken,
      toToken: tx.toToken,
      fromAmount: tx.fromAmount,
      toAmount: tx.toAmount,
      url: `https://arbiscan.io/tx/${tx.txHash}`,
      timestamp: tx.createdAt,
    }));

    const allTransactions = mainTransaction ? [mainTransaction, ...formattedTransactions] : formattedTransactions;

    return res.json({
      execution: {
        id: execution.id,
        status: execution.status,
        strategyName: execution.strategy.name,
        strategyType: execution.strategy.type,
        executedAt: execution.executedAt,
      },
      transactions: allTransactions,
    });
  } catch (error) {
    logger.error('Error fetching execution transactions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create DCA strategy
router.post('/dca', [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Strategy name must be between 1 and 100 characters'),
  body('fromToken')
    .isEthereumAddress()
    .withMessage('Valid from token address is required'),
  body('toToken')
    .isEthereumAddress()
    .withMessage('Valid to token address is required'),
  body('amountPerExecution')
    .isDecimal({ decimal_digits: '0,18' })
    .custom((value) => parseFloat(value) > 0)
    .withMessage('Amount per execution must be a positive number'),
  body('totalAmount')
    .isDecimal({ decimal_digits: '0,18' })
    .custom((value) => parseFloat(value) > 0)
    .withMessage('Total amount must be a positive number'),
  body('frequency')
    .matches(/^[\d\*\-\,\/\s]+$/)
    .withMessage('Invalid frequency format'),
  body('slippage')
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Slippage must be between 0.1 and 50'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, fromToken, toToken, amountPerExecution, totalAmount, frequency, slippage } = req.body;

    // Validate that total amount is divisible by amount per execution
    const executions = parseFloat(totalAmount) / parseFloat(amountPerExecution);
    if (executions < 1 || executions !== Math.floor(executions)) {
      return res.status(400).json({ 
        error: 'Total amount must be evenly divisible by amount per execution' 
      });
    }

    if (executions > 1000) {
      return res.status(400).json({ 
        error: 'Maximum 1000 executions allowed per strategy' 
      });
    }

    const parameters: DCAParameters = {
      fromToken,
      toToken,
      amountPerExecution,
      totalAmount,
      frequency,
      slippage,
      maxExecutions: Math.floor(executions),
    };

    const strategyId = await dcaStrategy.createStrategy(req.user!.id, name, parameters);

    logger.info(`DCA strategy created: ${strategyId} by user ${req.user!.id}`);

    return res.status(201).json({
      message: 'DCA strategy created successfully',
      strategyId,
    });
  } catch (error) {
    logger.error('Error creating DCA strategy:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Pause strategy
router.put('/:id/pause', [
  param('id').isUUID().withMessage('Invalid strategy ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const strategy = await prisma.strategy.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id 
      },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    if (strategy.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Only active strategies can be paused' });
    }

    await prisma.strategy.update({
      where: { id: strategy.id },
      data: { status: 'PAUSED' },
    });

    logger.info(`Strategy paused: ${strategy.id} by user ${req.user!.id}`);

    return res.json({ message: 'Strategy paused successfully' });
  } catch (error) {
    logger.error('Error pausing strategy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Resume strategy
router.put('/:id/resume', [
  param('id').isUUID().withMessage('Invalid strategy ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const strategy = await prisma.strategy.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id 
      },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    if (strategy.status !== 'PAUSED') {
      return res.status(400).json({ error: 'Only paused strategies can be resumed' });
    }

    await prisma.strategy.update({
      where: { id: strategy.id },
      data: { status: 'ACTIVE' },
    });

    logger.info(`Strategy resumed: ${strategy.id} by user ${req.user!.id}`);

    return res.json({ message: 'Strategy resumed successfully' });
  } catch (error) {
    logger.error('Error resuming strategy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Stop strategy
router.put('/:id/stop', [
  param('id').isUUID().withMessage('Invalid strategy ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const strategy = await prisma.strategy.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id 
      },
      include: { user: true },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    if (strategy.status === 'STOPPED' || strategy.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Strategy is already stopped' });
    }

    // Release locked funds
    const params = strategy.parameters as unknown as DCAParameters;
    const remainingAmount = new Decimal(params.totalAmount).sub(strategy.totalInvested);

    if (remainingAmount.gt(0)) {
      await prisma.balance.update({
        where: {
          userId_tokenAddress: {
            userId: strategy.userId,
            tokenAddress: params.fromToken,
          },
        },
        data: {
          lockedAmount: { decrement: remainingAmount },
        },
      });
    }

    await prisma.strategy.update({
      where: { id: strategy.id },
      data: { status: 'STOPPED' },
    });

    logger.info(`Strategy stopped: ${strategy.id} by user ${req.user!.id}`);

    return res.json({ message: 'Strategy stopped successfully' });
  } catch (error) {
    logger.error('Error stopping strategy:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual execution (for testing)
router.post('/:id/execute', [
  param('id').isUUID().withMessage('Invalid strategy ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const strategy = await prisma.strategy.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id 
      },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    if (strategy.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Strategy must be active to execute' });
    }

    if (strategy.type === 'DCA') {
      await dcaStrategy.executeStrategy(strategy.id);
    } else {
      return res.status(400).json({ error: 'Strategy type not supported for manual execution' });
    }

    logger.info(`Manual execution triggered for strategy: ${strategy.id} by user ${req.user!.id}`);

    return res.json({ message: 'Strategy execution initiated' });
  } catch (error) {
    logger.error('Error executing strategy:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Fix next execution time for a strategy
router.post('/:id/fix-schedule', [
  param('id').isUUID().withMessage('Invalid strategy ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const strategy = await prisma.strategy.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id 
      },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    if (strategy.type === 'DCA') {
      // Recalculate next execution time properly
      const params = strategy.parameters as unknown as DCAParameters;
      const dcaStrategy = new DCAStrategy();
      
      // Use current time as base for recalculation
      const currentTime = new Date();
      const cronParser = require('cron-parser');
      
      const interval = cronParser.parseExpression(params.frequency, {
        currentDate: currentTime,
        tz: 'UTC'
      });
      const correctedNextExecution = interval.next().toDate();

      await prisma.strategy.update({
        where: { id: strategy.id },
        data: { 
          nextExecution: correctedNextExecution,
        },
      });

      logger.info(`Fixed next execution time for strategy: ${strategy.id} - New time: ${correctedNextExecution.toISOString()}`);

      return res.json({ 
        message: 'Next execution time fixed successfully',
        oldNextExecution: strategy.nextExecution?.toISOString(),
        newNextExecution: correctedNextExecution.toISOString(),
        frequency: params.frequency,
      });
    } else {
      return res.status(400).json({ error: 'Strategy type not supported' });
    }
  } catch (error) {
    logger.error('Error fixing strategy schedule:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Fix strategies that exceeded their limits
router.post('/:id/fix-limits', [
  param('id').isUUID().withMessage('Invalid strategy ID'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const strategy = await prisma.strategy.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user!.id 
      },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    if (strategy.type === 'DCA') {
      const params = strategy.parameters as unknown as DCAParameters;
      const targetTotalAmount = new Decimal(params.totalAmount);
      const hasExceededAmount = strategy.totalInvested.gt(targetTotalAmount);
      
      // Check execution count
      const completedExecutions = await prisma.strategyExecution.count({
        where: {
          strategyId: strategy.id,
          status: 'COMPLETED'
        }
      });
      
      const hasExceededExecutions = params.maxExecutions && completedExecutions >= params.maxExecutions;
      
      if (hasExceededAmount || hasExceededExecutions) {
        // Mark strategy as completed since it exceeded limits
        await prisma.strategy.update({
          where: { id: strategy.id },
          data: { status: 'COMPLETED' }
        });

        logger.info(`Fixed strategy ${strategy.id} - marked as COMPLETED due to exceeded limits`);

        return res.json({ 
          message: 'Strategy marked as completed due to exceeded limits',
          details: {
            targetAmount: targetTotalAmount.toString(),
            actualInvested: strategy.totalInvested.toString(),
            exceededAmount: hasExceededAmount,
            maxExecutions: params.maxExecutions,
            actualExecutions: completedExecutions,
            exceededExecutions: hasExceededExecutions
          }
        });
      } else {
        return res.json({ 
          message: 'Strategy is within limits - no fix needed',
          details: {
            targetAmount: targetTotalAmount.toString(),
            actualInvested: strategy.totalInvested.toString(),
            maxExecutions: params.maxExecutions,
            actualExecutions: completedExecutions
          }
        });
      }
    } else {
      return res.status(400).json({ error: 'Strategy type not supported' });
    }
  } catch (error) {
    logger.error('Error fixing strategy limits:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router; 