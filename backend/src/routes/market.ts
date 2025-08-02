import express, { Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/security';
import { OneInchService } from '../services/oneinch';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import axios from 'axios';
import { ethers } from 'ethers';

const router: express.Router = express.Router();
const oneInchService = new OneInchService();

// Apply authentication and rate limiting
router.use(authenticateToken);
router.use(apiRateLimiter);

// Get supported tokens
router.get('/tokens', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tokens = await oneInchService.getTokens();
    return res.json({ tokens });
  } catch (error) {
    logger.error('Error fetching tokens:', error);
    return res.status(500).json({ error: 'Failed to fetch supported tokens' });
  }
});

// Get swap quote
router.get('/quote', [
  query('src')
    .isEthereumAddress()
    .withMessage('Valid source token address required'),
  query('dst')
    .isEthereumAddress()
    .withMessage('Valid destination token address required'),
  query('amount')
    .isNumeric()
    .custom((value: string) => parseFloat(value) > 0)
    .withMessage('Amount must be positive'),
  query('slippage')
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

    const { src, dst, amount, slippage } = req.query;
    // Use default slippage of 1% if not provided
    const defaultSlippage = slippage ? parseFloat(slippage as string) : 1.0;

    const quote = await oneInchService.getQuote({
      src: src as string,
      dst: dst as string,
      amount: amount as string,
      slippage: defaultSlippage,
    });

    return res.json({ quote });
  } catch (error) {
    logger.error('Error getting quote:', error);
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to get quote' });
    }
  }
});

// Get supported protocols
router.get('/protocols', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const protocols = await oneInchService.getProtocols();
    return res.json({ protocols });
  } catch (error) {
    logger.error('Error fetching protocols:', error);
    return res.status(500).json({ error: 'Failed to fetch protocols' });
  }
});

// Get gas price information
router.get('/gas-price', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Call 1inch gas price API
    const url = `https://api.1inch.dev/gas-price/v1.6/${config.CHAIN_ID}`;
    
    const apiConfig = {
      headers: {
        Authorization: `Bearer ${config.ONEINCH_API_KEY}`,
      },
      params: {},
      paramsSerializer: {
        indexes: null,
      },
    };

    const response = await axios.get(url, apiConfig);
    const gasData = response.data;

    // Helper function to convert wei to gwei
    const weiToGwei = (weiValue: string): string => {
      return (parseInt(weiValue) / 1e9).toFixed(2);
    };

    // Format response to match existing structure and convert to gwei
    const formattedResponse = {
      gasPrice: {
        low: weiToGwei(gasData.low?.maxFeePerGas || '20000000000'), // fallback 20 gwei
        medium: weiToGwei(gasData.medium?.maxFeePerGas || '25000000000'), // fallback 25 gwei  
        high: weiToGwei(gasData.high?.maxFeePerGas || '30000000000'), // fallback 30 gwei
        instant: weiToGwei(gasData.instant?.maxFeePerGas || '35000000000'), // fallback 35 gwei
      },
      priorityFee: {
        low: weiToGwei(gasData.low?.maxPriorityFeePerGas || '1000000000'), // fallback 1 gwei
        medium: weiToGwei(gasData.medium?.maxPriorityFeePerGas || '1500000000'), // fallback 1.5 gwei
        high: weiToGwei(gasData.high?.maxPriorityFeePerGas || '2000000000'), // fallback 2 gwei
        instant: weiToGwei(gasData.instant?.maxPriorityFeePerGas || '3000000000'), // fallback 3 gwei
      },
      baseFee: weiToGwei(gasData.baseFee || '10000000000'), // fallback 10 gwei
      unit: 'gwei',
      chainId: config.CHAIN_ID,
      timestamp: new Date().toISOString(),
    };

    return res.json(formattedResponse);
  } catch (error) {
    logger.error('Error fetching gas price from 1inch API:', error);
    
    // Fallback to default values if API fails
    return res.json({
      gasPrice: {
        low: '20.00',
        medium: '25.00', 
        high: '30.00',
        instant: '35.00',
      },
      priorityFee: {
        low: '1.00',
        medium: '1.50',
        high: '2.00', 
        instant: '3.00',
      },
      baseFee: '10.00',
      unit: 'gwei',
      chainId: config.CHAIN_ID,
      timestamp: new Date().toISOString(),
      note: 'Fallback values - API unavailable',
    });
  }
});

// Token price endpoint using 1inch Price API
router.get('/price/:tokenAddress', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    
    // Call 1inch Price API for single token
    const url = `https://api.1inch.dev/price/v1.1/${config.CHAIN_ID}`;
    
    const payload = {
      tokens: [tokenAddress]
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${config.ONEINCH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const prices = response.data as Record<string, number>;
      const price = prices[tokenAddress];
      
      if (price !== undefined) {
        return res.json({
          tokenAddress,
          price: price.toString(),
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
          source: '1inch',
        });
      } else {
        return res.status(404).json({ 
          error: 'Price not found for this token',
          tokenAddress 
        });
      }
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    logger.error('Error fetching token price from 1inch:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch token price',
      tokenAddress: req.params.tokenAddress,
      fallback: true
    });
  }
});

// Batch token prices endpoint
router.post('/prices', [
  query('tokens')
    .isArray({ min: 1, max: 100 })
    .withMessage('Tokens array required (1-100 tokens)'),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { tokens } = req.body;

    // Validate token addresses
    const invalidTokens = tokens.filter((token: string) => !ethers.isAddress(token));
    if (invalidTokens.length > 0) {
      return res.status(400).json({
        error: 'Invalid token addresses',
        invalidTokens
      });
    }

    // Call 1inch Price API for batch tokens
    const url = `https://api.1inch.dev/price/v1.1/${config.CHAIN_ID}`;
    
    const payload = {
      tokens: tokens,
      "currency": "USD"
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${config.ONEINCH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const prices = response.data as Record<string, number>;
      
      // Format response with additional metadata
      const formattedPrices = Object.entries(prices).map(([tokenAddress, price]) => ({
        tokenAddress,
        price: (price as number).toString(),
        currency: 'USD',
      }));

      return res.json({
        prices: formattedPrices,
        totalTokens: formattedPrices.length,
        requestedTokens: tokens.length,
        lastUpdated: new Date().toISOString(),
        source: '1inch',
        chainId: config.CHAIN_ID,
      });
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    logger.error('Error fetching batch token prices from 1inch:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch token prices',
      fallback: true
    });
  }
});

export default router; 