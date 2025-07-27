import express, { Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../database/connection';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { tradingRateLimiter } from '../middleware/security';
import { BlockchainService } from '../services/blockchain';
import { DepositVerifierService } from '../services/depositVerifier';
import { OneInchService } from '../services/oneinch';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

const router: express.Router = express.Router();
const blockchainService = new BlockchainService();
const depositVerifier = new DepositVerifierService();
const oneInchService = new OneInchService();

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

// 💱 SWAP TOKENS - Execute token swap using 1inch
router.post('/swap', [
  body('fromToken')
    .isEthereumAddress()
    .withMessage('Valid from token address required'),
  body('toToken')
    .isEthereumAddress()
    .withMessage('Valid to token address required'),
  body('amount')
    .isDecimal({ decimal_digits: '0,18' })
    .custom((value: string) => parseFloat(value) > 0)
    .withMessage('Amount must be positive number with max 18 decimals'),
  body('slippage')
    .optional()
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

    const { fromToken, toToken, amount, slippage = 1.0 } = req.body;
    const userId = req.user!.id;

    logger.info(`Processing swap request: ${amount} from ${fromToken} to ${toToken} for user ${userId}`);

    // 1. Check user balance
    const userBalance = await prisma.balance.findUnique({
      where: {
        userId_tokenAddress: {
          userId,
          tokenAddress: fromToken,
        },
      },
    });

    if (!userBalance) {
      return res.status(400).json({ error: 'No balance found for source token' });
    }

    const requestedAmount = new Decimal(amount);
    const availableAmount = userBalance.amount.sub(userBalance.lockedAmount);

    if (availableAmount.lt(requestedAmount)) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        available: availableAmount.toString(),
        requested: requestedAmount.toString()
      });
    }

    // 2. Lock the amount to prevent double-spending
    await prisma.balance.update({
      where: { id: userBalance.id },
      data: {
        lockedAmount: { increment: requestedAmount },
      },
    });

    let swapTxHash: string | null = null;

    try {
      // 3. Get token decimals for proper amount calculation
      const fromTokenInfo = await depositVerifier.getTokenInfo(fromToken);
      if (!fromTokenInfo) {
        throw new Error('Unable to get source token information');
      }

      // 4. Convert amount to wei (smallest unit)
      const amountInWei = requestedAmount.mul(new Decimal(10).pow(fromTokenInfo.decimals)).toString();

      // 5. Check and approve token allowance BEFORE calling 1inch (if needed)
      if (fromToken !== '0x0000000000000000000000000000000000000000' && 
          fromToken !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        
        logger.info('Checking token allowance for 1inch router...');
        const allowance = await oneInchService.checkAllowance(
          fromToken,
          blockchainService.getMasterAddress()
        );

        if (new Decimal(allowance).lt(new Decimal(amountInWei))) {
          logger.info(`Insufficient allowance (${allowance}), approving token for amount: ${amountInWei}...`);
          const approveTx = await oneInchService.getApproveTransaction(fromToken);
          
          const approveTxHash = await blockchainService.sendTransaction({
            to: approveTx.to,
            data: approveTx.data,
            value: approveTx.value,
            gasLimit: approveTx.gas,
            gasPrice: approveTx.gasPrice,
          });

          // Wait for approval confirmation
          logger.info(`Waiting for approval confirmation: ${approveTxHash}`);
          await blockchainService.waitForTransaction(approveTxHash, 1);
          logger.info(`Token approved successfully: ${approveTxHash}`);
        } else {
          logger.info(`Sufficient allowance available: ${allowance}`);
        }
      }

      // 6. Get swap transaction from 1inch (now that allowance is sufficient)
      logger.info('Getting swap transaction from 1inch...');
      const swapTx = await oneInchService.getSwap({
        src: fromToken,
        dst: toToken,
        amount: amountInWei,
        from: blockchainService.getMasterAddress(),
        slippage: slippage,
        disableEstimate: false,
        allowPartialFill: false,
      });

      // 7. Execute swap transaction
      logger.info('Executing swap transaction...');
      swapTxHash = await blockchainService.sendTransaction({
        to: swapTx.to,
        data: swapTx.data,
        value: swapTx.value,
        gasLimit: swapTx.gas,
        gasPrice: swapTx.gasPrice,
      });

      // 8. Wait for confirmation
      const receipt = await blockchainService.waitForTransaction(swapTxHash, 1);
      
      if (!receipt || receipt.status !== 1) {
        throw new Error('Swap transaction failed');
      }

      // 9. Get destination token info
      const toTokenInfo = await depositVerifier.getTokenInfo(toToken);
      if (!toTokenInfo) {
        throw new Error('Unable to get destination token information');
      }

      // 10. Parse transaction logs to get actual received amount
      // For now, we'll use a simplified approach - in production you'd parse the logs
      const estimatedOutput = new Decimal(swapTx.value || '0');

      // 11. Update user balances
      await prisma.$transaction(async (tx) => {
        // Deduct from source token
        await tx.balance.update({
          where: { id: userBalance.id },
          data: {
            amount: { decrement: requestedAmount },
            lockedAmount: { decrement: requestedAmount },
          },
        });

        // Add to destination token (create if doesn't exist)
        const receivedAmount = estimatedOutput.div(new Decimal(10).pow(toTokenInfo.decimals));
        
        await tx.balance.upsert({
          where: {
            userId_tokenAddress: {
              userId,
              tokenAddress: toToken,
            },
          },
          update: {
            amount: { increment: receivedAmount },
          },
          create: {
            userId,
            tokenAddress: toToken,
            tokenSymbol: toTokenInfo.symbol,
            amount: receivedAmount,
          },
        });

        // Record the transaction
        await tx.transaction.create({
          data: {
            userId,
            type: 'SWAP',
            txHash: swapTxHash!,
            fromToken,
            toToken,
            fromAmount: requestedAmount,
            toAmount: receivedAmount,
            status: 'CONFIRMED',
          },
        });
      });

      logger.info(`Swap completed successfully: ${swapTxHash}`, {
        userId,
        fromToken,
        toToken,
        fromAmount: requestedAmount.toString(),
        txHash: swapTxHash
      });

      return res.json({
        message: 'Swap executed successfully',
        transaction: {
          txHash: swapTxHash,
          fromToken,
          toToken,
          fromAmount: requestedAmount.toString(),
          fromSymbol: fromTokenInfo.symbol,
          toSymbol: toTokenInfo.symbol,
          slippage,
          status: 'COMPLETED'
        }
      });

    } catch (swapError) {
      // Unlock the amount if swap failed
      await prisma.balance.update({
        where: { id: userBalance.id },
        data: {
          lockedAmount: { decrement: requestedAmount },
        },
      });

      logger.error('Swap failed:', swapError);
      throw swapError;
    }

  } catch (error) {
    logger.error('Error processing swap:', error);
    return res.status(500).json({ 
      error: 'Swap failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 💸 WITHDRAW FUNDS - Transfer funds from platform to user wallet
router.post('/withdraw', [
  body('tokenAddress')
    .isEthereumAddress()
    .withMessage('Valid token address required'),
  body('amount')
    .isDecimal({ decimal_digits: '0,18' })
    .custom((value: string) => parseFloat(value) > 0)
    .withMessage('Amount must be positive number with max 18 decimals'),
  body('toAddress')
    .isEthereumAddress()
    .withMessage('Valid recipient address required'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { tokenAddress, amount, toAddress } = req.body;
    const userId = req.user!.id;

    logger.info(`Processing withdrawal: ${amount} ${tokenAddress} to ${toAddress} for user ${userId}`);

    // 1. Check user balance
    const userBalance = await prisma.balance.findUnique({
      where: {
        userId_tokenAddress: {
          userId,
          tokenAddress,
        },
      },
    });

    if (!userBalance) {
      return res.status(400).json({ error: 'No balance found for this token' });
    }

    const withdrawAmount = new Decimal(amount);
    const availableAmount = userBalance.amount.sub(userBalance.lockedAmount);

    if (availableAmount.lt(withdrawAmount)) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        available: availableAmount.toString(),
        requested: withdrawAmount.toString()
      });
    }

    // 2. Get token information
    const tokenInfo = await depositVerifier.getTokenInfo(tokenAddress);
    if (!tokenInfo) {
      return res.status(400).json({ error: 'Unable to get token information' });
    }

    // 3. Calculate withdrawal fee (0.1% of amount)
    const withdrawalFee = withdrawAmount.mul(new Decimal(0.001));
    const netWithdrawAmount = withdrawAmount.sub(withdrawalFee);

    // 4. Lock the withdrawal amount (including fee)
    await prisma.balance.update({
      where: { id: userBalance.id },
      data: {
        lockedAmount: { increment: withdrawAmount },
      },
    });

    let withdrawalTxHash: string | null = null;

    try {
      // 5. Calculate amount in wei
      const amountInWei = netWithdrawAmount.mul(new Decimal(10).pow(tokenInfo.decimals));

      // 6. Execute withdrawal transaction
      if (tokenAddress === '0x0000000000000000000000000000000000000000' || 
          tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        
        // ETH withdrawal
        withdrawalTxHash = await blockchainService.sendTransaction({
          to: toAddress,
          value: amountInWei.toString(),
          data: '0x',
        });

      } else {
        // ERC20 token withdrawal
        const amountHex = BigInt(amountInWei.toString()).toString(16).padStart(64, '0');
        const transferData = `0xa9059cbb${toAddress.slice(2).padStart(64, '0')}${amountHex}`;
        
        withdrawalTxHash = await blockchainService.sendTransaction({
          to: tokenAddress,
          data: transferData,
          value: '0',
        });
      }

      // 7. Wait for confirmation
      const receipt = await blockchainService.waitForTransaction(withdrawalTxHash, 1);
      
      if (!receipt || receipt.status !== 1) {
        throw new Error('Withdrawal transaction failed');
      }

      // 8. Update user balance and record withdrawal
      await prisma.$transaction(async (tx) => {
        // Deduct from user balance (including fee)
        await tx.balance.update({
          where: { id: userBalance.id },
          data: {
            amount: { decrement: withdrawAmount },
            lockedAmount: { decrement: withdrawAmount },
          },
        });

        // Record withdrawal
        await tx.withdrawal.create({
          data: {
            userId,
            txHash: withdrawalTxHash!,
            tokenAddress,
            tokenSymbol: tokenInfo.symbol,
            amount: netWithdrawAmount,
            fee: withdrawalFee,
            toAddress,
            status: 'COMPLETED',
          },
        });

        // Record transaction
        await tx.transaction.create({
          data: {
            userId,
            type: 'WITHDRAWAL',
            txHash: withdrawalTxHash!,
            fromToken: tokenAddress,
            fromAmount: withdrawAmount,
            status: 'CONFIRMED',
          },
        });
      });

      logger.info(`Withdrawal completed successfully: ${withdrawalTxHash}`, {
        userId,
        tokenAddress,
        amount: withdrawAmount.toString(),
        netAmount: netWithdrawAmount.toString(),
        fee: withdrawalFee.toString(),
        toAddress,
        txHash: withdrawalTxHash
      });

      return res.json({
        message: 'Withdrawal executed successfully',
        withdrawal: {
          txHash: withdrawalTxHash,
          tokenAddress,
          tokenSymbol: tokenInfo.symbol,
          grossAmount: withdrawAmount.toString(),
          netAmount: netWithdrawAmount.toString(),
          fee: withdrawalFee.toString(),
          toAddress,
          status: 'COMPLETED'
        }
      });

    } catch (withdrawalError) {
      // Unlock the amount if withdrawal failed
      await prisma.balance.update({
        where: { id: userBalance.id },
        data: {
          lockedAmount: { decrement: withdrawAmount },
        },
      });

      logger.error('Withdrawal failed:', withdrawalError);
      throw withdrawalError;
    }

  } catch (error) {
    logger.error('Error processing withdrawal:', error);
    return res.status(500).json({ 
      error: 'Withdrawal failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 