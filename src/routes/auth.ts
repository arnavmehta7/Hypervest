import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import { prisma } from '../database/connection';
import { authenticateWallet, AuthenticatedRequest, generateAuthMessage, verifySignature, generateSessionToken } from '../middleware/auth';
import { authRateLimiter } from '../middleware/security';
import { logger } from '../utils/logger';

const router: express.Router = express.Router();

// Apply auth rate limiting to all routes
router.use(authRateLimiter);

// Get nonce for wallet authentication
router.post('/nonce', [
  body('walletAddress')
    .isEthereumAddress()
    .withMessage('Valid wallet address is required'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { walletAddress } = req.body;
    const normalizedAddress = walletAddress.toLowerCase();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
      select: { id: true, walletAddress: true, nonce: true },
    });

    if (!user) {
      // Create new user with this wallet address
      const newNonce = ethers.hexlify(ethers.randomBytes(16));
      user = await prisma.user.create({
        data: {
          walletAddress: normalizedAddress,
          nonce: newNonce,
        },
        select: { id: true, walletAddress: true, nonce: true },
      });
      
      logger.info(`New user created for wallet: ${normalizedAddress}`);
    }

    const timestamp = Date.now();
    const message = generateAuthMessage(walletAddress, user.nonce, timestamp);

    return res.json({
      message,
      nonce: user.nonce,
      timestamp,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    logger.error('Nonce generation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Authenticate with wallet signature
router.post('/authenticate', [
  body('walletAddress')
    .isEthereumAddress()
    .withMessage('Valid wallet address is required'),
  body('signature')
    .isLength({ min: 130, max: 132 })
    .withMessage('Valid signature is required'),
  body('message')
    .isLength({ min: 1 })
    .withMessage('Message is required'),
  body('timestamp')
    .isNumeric()
    .withMessage('Valid timestamp is required'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { walletAddress, signature, message, timestamp } = req.body;
    const normalizedAddress = walletAddress.toLowerCase();

    // Check timestamp (should be within 5 minutes)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      return res.status(401).json({ error: 'Authentication timestamp expired' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { 
        walletAddress: normalizedAddress,
        isActive: true 
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Wallet not registered' });
    }

    // Verify the signature matches the expected message format
    const expectedMessage = generateAuthMessage(walletAddress, user.nonce, timestamp);
    if (message !== expectedMessage) {
      return res.status(401).json({ error: 'Invalid message format' });
    }

    // Verify signature
    if (!verifySignature(message, signature, walletAddress)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Generate new nonce for next authentication
    const newNonce = ethers.hexlify(ethers.randomBytes(16));
    await prisma.user.update({
      where: { id: user.id },
      data: { nonce: newNonce },
    });

    // Create session token (JWT-based)
    const sessionToken = generateSessionToken(user.id, user.walletAddress);

    logger.info(`User authenticated: ${normalizedAddress}`);

    return res.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
      authToken: sessionToken,
      sessionExpiry: now + (24 * 60 * 60 * 1000), // 24 hours from now
    });
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateWallet, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        walletAddress: true,
        createdAt: true,
        updatedAt: true,
        balances: {
          select: {
            tokenSymbol: true,
            tokenAddress: true,
            amount: true,
            lockedAmount: true,
          },
        },
        strategies: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            totalInvested: true,
            totalReceived: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fresh nonce for existing user (for re-authentication)
router.post('/refresh-nonce', [
  body('walletAddress')
    .isEthereumAddress()
    .withMessage('Valid wallet address is required'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { walletAddress } = req.body;
    const normalizedAddress = walletAddress.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Generate new nonce
    const newNonce = ethers.hexlify(ethers.randomBytes(16));
    await prisma.user.update({
      where: { id: user.id },
      data: { nonce: newNonce },
    });

    const timestamp = Date.now();
    const message = generateAuthMessage(walletAddress, newNonce, timestamp);

    return res.json({
      message,
      nonce: newNonce,
      timestamp,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    logger.error('Nonce refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 