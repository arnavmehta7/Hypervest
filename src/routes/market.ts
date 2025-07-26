import express, { Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/security';
import { OneInchService } from '../services/oneinch';
import { logger } from '../utils/logger';

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
    // This would typically come from a gas price oracle
    // For now, we'll return a simple response
    return res.json({
      gasPrice: {
        standard: '20',
        fast: '25',
        instant: '30',
      },
      unit: 'gwei',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching gas price:', error);
    return res.status(500).json({ error: 'Failed to fetch gas price' });
  }
});

// Token price endpoint (placeholder - integrate with price feed)
router.get('/price/:tokenAddress', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tokenAddress } = req.params;
    
    // This is a placeholder - integrate with Coingecko, CoinMarketCap, or chain price feeds
    return res.json({
      tokenAddress,
      price: '0.00', // USD price
      change24h: '0.00',
      lastUpdated: new Date().toISOString(),
      note: 'Price feed integration pending',
    });
  } catch (error) {
    logger.error('Error fetching token price:', error);
    return res.status(500).json({ error: 'Failed to fetch token price' });
  }
});

export default router; 