import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../database/connection';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
  };
}

export interface WalletAuthPayload {
  walletAddress: string;
  signature: string;
  message: string;
  timestamp: number;
}

export interface SessionPayload {
  userId: string;
  walletAddress: string;
  iat: number;
  exp: number;
}

// Generate a message for signing
export const generateAuthMessage = (walletAddress: string, nonce: string, timestamp: number): string => {
  return `Welcome to Hypervest!\n\nPlease sign this message to authenticate your wallet.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
};

// Verify wallet signature
export const verifySignature = (message: string, signature: string, expectedAddress: string): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    logger.error('Signature verification failed:', error);
    return false;
  }
};

// Generate session token (simpler approach)
export const generateSessionToken = (userId: string, walletAddress: string): string => {
  return jwt.sign(
    { userId, walletAddress },
    config.JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'hypervest',
      audience: 'hypervest-client',
    }
  );
};

export const authenticateWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Wallet ')) {
      res.status(401).json({ error: 'Wallet authentication required' });
      return;
    }

    // Extract session token from header
    const sessionToken = authHeader.replace('Wallet ', '');
    
    try {
      // Verify JWT session token
      const decoded = jwt.verify(sessionToken, config.JWT_SECRET) as SessionPayload;
      
      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { 
          id: decoded.userId,
          walletAddress: decoded.walletAddress.toLowerCase(),
          isActive: true 
        },
        select: { 
          id: true, 
          walletAddress: true,
          isActive: true 
        },
      });

      if (!user) {
        res.status(401).json({ error: 'User not found or inactive' });
        return;
      }

      req.user = {
        id: user.id,
        walletAddress: user.walletAddress,
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Session expired' });
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid session token' });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
};

// For backward compatibility, keep the old name
export const authenticateToken = authenticateWallet; 