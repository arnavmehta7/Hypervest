import express, { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../database/connection';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { tradingRateLimiter } from '../middleware/security';
import { BlockchainService } from '../services/blockchain';
import { DepositVerifierService } from '../services/depositVerifier';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

const router: express.Router = express.Router();
const blockchainService = new BlockchainService();
const depositVerifier = new DepositVerifierService();

// Apply authentication and rate limiting
router.use(authenticateToken);
router.use(tradingRateLimiter);

// Get user balances
router.get('/balances', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const balances = await prisma.balance.findMany({
      where: { userId: req.user!.id },
      orderBy: { tokenSymbol: 'asc' },
    });

    return res.json({ balances });
  } catch (error) {
    logger.error('Error fetching balances:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get master wallet info (for deposits)
router.get('/deposit-address', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const masterAddress = blockchainService.getMasterAddress();
    
    return res.json({
      address: masterAddress,
      chainId: 11155111, // Sepolia
      note: 'Send funds to this address. Transaction will be automatically verified on-chain.',
      minimumConfirmations: 3,
    });
  } catch (error) {
    logger.error('Error getting deposit address:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// SECURE: Submit a deposit transaction for verification
router.post('/deposits', [
  body('txHash')
    .isHexadecimal()
    .isLength({ min: 66, max: 66 })
    .withMessage('Valid transaction hash required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { txHash } = req.body;
    const userId = req.user!.id;

    // 🔒 SECURITY: Check if this transaction was already processed
    const alreadyProcessed = await depositVerifier.isTransactionAlreadyProcessed(txHash);
    if (alreadyProcessed) {
      return res.status(400).json({ error: 'Transaction already processed' });
    }

    // 🔒 SECURITY: Verify the transaction on the blockchain
    logger.info(`Verifying deposit transaction ${txHash} for user ${userId}`);
    const verification = await depositVerifier.verifyDeposit(txHash);

    if (!verification.isValid) {
      logger.warn(`Invalid deposit attempt: ${txHash}`, { 
        userId, 
        error: verification.error,
        from: verification.from,
        to: verification.to 
      });
      
      return res.status(400).json({ 
        error: 'Transaction verification failed',
        details: verification.error,
        verification: {
          txHash: verification.txHash,
          confirmations: verification.confirmations,
          isValid: false
        }
      });
    }

    // 🔒 SECURITY: Get token information from the blockchain
    const tokenInfo = await depositVerifier.getTokenInfo(verification.tokenAddress!);
    if (!tokenInfo) {
      return res.status(400).json({ 
        error: 'Unable to verify token information',
        tokenAddress: verification.tokenAddress 
      });
    }

    // Calculate the actual amount (handle decimals)
    const rawAmount = verification.tokenAmount!;
    const actualAmount = new Decimal(rawAmount).div(new Decimal(10).pow(tokenInfo.decimals));

    // Create deposit record with VERIFIED data
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        txHash: verification.txHash,
        tokenAddress: verification.tokenAddress!,
        tokenSymbol: tokenInfo.symbol,
        amount: actualAmount,
        status: 'CONFIRMED', // Only confirmed after blockchain verification
      },
    });

    // Update or create user balance with VERIFIED amount
    await prisma.balance.upsert({
      where: {
        userId_tokenAddress: {
          userId,
          tokenAddress: verification.tokenAddress!,
        },
      },
      update: {
        amount: { increment: actualAmount },
      },
      create: {
        userId,
        tokenAddress: verification.tokenAddress!,
        tokenSymbol: tokenInfo.symbol,
        amount: actualAmount,
      },
    });

    logger.info(`Verified deposit processed: ${deposit.id}`, {
      userId,
      txHash: verification.txHash,
      amount: actualAmount.toString(),
      token: tokenInfo.symbol,
      confirmations: verification.confirmations
    });

    return res.status(201).json({
      message: 'Deposit verified and processed successfully',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        tokenSymbol: deposit.tokenSymbol,
        tokenAddress: deposit.tokenAddress,
        txHash: deposit.txHash,
        status: deposit.status,
      },
      verification: {
        confirmations: verification.confirmations,
        from: verification.from,
        to: verification.to,
        isValid: true,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error processing deposit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Check deposit status (for pending transactions)
router.get('/deposits/:txHash/status', [
  param('txHash')
    .isHexadecimal()
    .isLength({ min: 66, max: 66 })
    .withMessage('Valid transaction hash required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { txHash } = req.params;

    // Check if already processed
    const existingDeposit = await prisma.deposit.findUnique({
      where: { txHash },
    });

    if (existingDeposit) {
      return res.json({
        status: 'processed',
        deposit: existingDeposit,
        message: 'Deposit has already been processed'
      });
    }

    // Check current status on blockchain
    const verification = await depositVerifier.verifyDeposit(txHash);
    
    return res.json({
      status: verification.isValid ? 'ready' : 'pending',
      verification: {
        txHash: verification.txHash,
        confirmations: verification.confirmations,
        isValid: verification.isValid,
        error: verification.error,
        from: verification.from,
        to: verification.to
      },
      message: verification.isValid 
        ? 'Transaction verified and ready to process'
        : `Transaction pending: ${verification.error}`
    });
  } catch (error) {
    logger.error('Error checking deposit status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 