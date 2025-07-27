import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface SwapParams {
  src: string;      // source token address
  dst: string;      // destination token address
  amount: string;   // amount to swap
  from: string;     // sender address (required for swap)
  slippage: number; // slippage percentage
  disableEstimate?: boolean;
  allowPartialFill?: boolean;
  fee?: number;     // partner fee (0-3%)
  gasPrice?: string;
  protocols?: string;
  includeTokensInfo?: boolean;
  includeProtocols?: boolean;
  includeGas?: boolean;
}

export interface SwapQuote {
  srcToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  };
  dstToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  };
  dstAmount: string;
  protocols?: any[];
  gas?: number;
}

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export class OneInchService {
  private client: AxiosInstance;
  private baseURL: string;
  private apiChainId: number; // Always use mainnet for 1inch API
  private actualChainId: number; // The real chain we're operating on

  constructor() {
    this.actualChainId = config.CHAIN_ID;
    this.apiChainId = 1; // Force mainnet for 1inch API calls
    this.baseURL = config.ONEINCH_BASE_URL || 'https://api.1inch.dev';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${config.ONEINCH_API_KEY}`,
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      timeout: 30000,
    });

    logger.info(`1inch service initialized - API calls use mainnet (${this.apiChainId}), actual chain: ${this.actualChainId}`);
  }

  /**
   * Get swap quote from 1inch API v6.0 (following official docs)
   */
  async getQuote(params: Omit<SwapParams, 'from'>): Promise<SwapQuote> {
    try {
      const queryParams: Record<string, any> = {
        src: params.src,
        dst: params.dst,
        amount: params.amount,
        includeTokensInfo: true,
        includeProtocols: params.includeProtocols || false,
        includeGas: params.includeGas || false,
      };

      // Add optional parameters if provided
      if (params.fee !== undefined) {
        queryParams.fee = params.fee;
      }
      if (params.gasPrice) {
        queryParams.gasPrice = params.gasPrice;
      }
      if (params.protocols) {
        queryParams.protocols = params.protocols;
      }

      const response = await this.client.get(`/swap/v6.0/${this.apiChainId}/quote`, {
        params: queryParams,
      });

      logger.debug('1inch quote received', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error getting 1inch quote:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.description || error.response?.data?.error || error.message;
        throw new Error(`1inch quote failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get swap transaction data from 1inch API v6.0 (following official docs)
   */
  async getSwap(params: SwapParams): Promise<SwapTransaction> {
    try {
      if (!params.from) {
        throw new Error('from address is required for swap transaction');
      }

      const queryParams: Record<string, any> = {
        src: params.src,
        dst: params.dst,
        amount: params.amount,
        from: params.from,
        slippage: params.slippage.toString(),
        disableEstimate: params.disableEstimate || false,
        allowPartialFill: params.allowPartialFill || false,
      };

      // Add optional parameters if provided
      if (params.fee !== undefined) {
        queryParams.fee = params.fee.toString();
      }
      if (params.gasPrice) {
        queryParams.gasPrice = params.gasPrice;
      }
      if (params.protocols) {
        queryParams.protocols = params.protocols;
      }

      logger.debug('1inch swap request params:', queryParams);

      const response = await this.client.get(`/swap/v6.0/${this.apiChainId}/swap`, {
        params: queryParams,
      });

      logger.debug('1inch swap response:', response.data);
      
      // Return the transaction object from the response
      if (!response.data.tx) {
        throw new Error('Invalid response: missing transaction data');
      }

      return response.data.tx;
    } catch (error) {
      logger.error('Error getting 1inch swap:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        logger.error('1inch API error details:', errorData);
        const errorMessage = errorData?.description || errorData?.error || error.message;
        throw new Error(`1inch swap failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Check token allowance for 1inch router
   */
  async checkAllowance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const response = await this.client.get(`/swap/v6.0/${this.apiChainId}/approve/allowance`, {
        params: {
          tokenAddress,
          walletAddress,
        },
      });
      
      logger.debug('1inch allowance check:', response.data);
      return response.data.allowance || '0';
    } catch (error) {
      logger.error('Error checking 1inch allowance:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.description || error.response?.data?.error || error.message;
        throw new Error(`1inch allowance check failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get approve transaction data for 1inch router
   */
  async getApproveTransaction(tokenAddress: string, amount?: string): Promise<SwapTransaction> {
    try {
      const params: any = { tokenAddress };
      if (amount) {
        params.amount = amount;
      }

      const response = await this.client.get(`/swap/v6.0/${this.apiChainId}/approve/transaction`, {
        params,
      });
      
      logger.debug('1inch approve transaction:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Error getting 1inch approve transaction:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.description || error.response?.data?.error || error.message;
        throw new Error(`1inch approve transaction failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get 1inch router address for the current chain
   */
  async getRouterAddress(): Promise<string> {
    try {
      const response = await this.client.get(`/swap/v6.0/${this.apiChainId}/approve/spender`);
      
      return response.data.address;
    } catch (error) {
      logger.error('Error getting 1inch router address:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.description || error.response?.data?.error || error.message;
        throw new Error(`1inch router address failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get supported tokens for the current chain
   */
  async getTokens(): Promise<Record<string, TokenInfo>> {
    try {
      const response = await this.client.get(`/swap/v6.0/${this.apiChainId}/tokens`);
      
      logger.debug('1inch tokens fetched');
      return response.data.tokens || {};
    } catch (error) {
      logger.error('Error getting 1inch tokens:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.description || error.response?.data?.error || error.message;
        throw new Error(`1inch tokens failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get supported protocols/liquidity sources
   */
  async getProtocols(): Promise<any> {
    try {
      const response = await this.client.get(`/swap/v6.0/${this.apiChainId}/liquidity-sources`);
      
      logger.debug('1inch protocols fetched');
      return response.data.protocols || {};
    } catch (error) {
      logger.error('Error getting 1inch protocols:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.description || error.response?.data?.error || error.message;
        throw new Error(`1inch protocols failed: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get the actual chain ID we're operating on (for blockchain operations)
   */
  getActualChainId(): number {
    return this.actualChainId;
  }

  /**
   * Get the API chain ID used for 1inch calls (always mainnet)
   */
  getApiChainId(): number {
    return this.apiChainId;
  }
} 