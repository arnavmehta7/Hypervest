import { ethers } from 'ethers';
import { BlockchainService } from './blockchain';
import { logger } from '../utils/logger';

export interface DepositVerification {
  isValid: boolean;
  txHash: string;
  from: string;
  to: string;
  value: string;
  tokenAddress?: string;
  tokenAmount?: string;
  confirmations: number;
  error?: string;
}

export class DepositVerifierService {
  private blockchainService: BlockchainService;
  private masterWalletAddress: string;
  private minimumConfirmations: number;

  constructor() {
    this.blockchainService = new BlockchainService();
    this.masterWalletAddress = this.blockchainService.getMasterAddress().toLowerCase();
    this.minimumConfirmations = 3; // Require 3 confirmations
  }

  /**
   * Verify a deposit transaction on the blockchain
   */
  async verifyDeposit(txHash: string): Promise<DepositVerification> {
    try {
      // Get transaction receipt
      const provider = this.blockchainService.getProvider();
      logger.info(`Checking if transaction ${txHash} has already been processed..., the chain id is ${this.blockchainService.getChainId()}`);
      logger.info(`Verifying deposit transaction: ${txHash}, provider: ${provider}, masterWalletAddress: ${this.masterWalletAddress}`);
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        return {
          isValid: false,
          txHash,
          from: '',
          to: '',
          value: '0',
          confirmations: 0,
          error: 'Transaction not found on blockchain'
        };
      }

      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          isValid: false,
          txHash,
          from: tx.from || '',
          to: tx.to || '',
          value: tx.value.toString(),
          confirmations: 0,
          error: 'Transaction receipt not found'
        };
      }

      // Check if transaction was successful
      if (receipt.status !== 1) {
        return {
          isValid: false,
          txHash,
          from: tx.from || '',
          to: tx.to || '',
          value: tx.value.toString(),
          confirmations: 0,
          error: 'Transaction failed on blockchain'
        };
      }

      // Get current block number for confirmation calculation
      const currentBlock = await provider.getBlockNumber();
      const confirmations = receipt.blockNumber ? currentBlock - receipt.blockNumber + 1 : 0;

      // Check minimum confirmations
      if (confirmations < this.minimumConfirmations) {
        return {
          isValid: false,
          txHash,
          from: tx.from || '',
          to: tx.to || '',
          value: tx.value.toString(),
          confirmations,
          error: `Insufficient confirmations: ${confirmations}/${this.minimumConfirmations} required`
        };
      }

      // TODO: for later
      // // Verify transaction was sent TO our master wallet
      // if (tx.to?.toLowerCase() !== this.masterWalletAddress) {
      //   return {
      //     isValid: false,
      //     txHash,
      //     from: tx.from || '',
      //     to: tx.to || '',
      //     value: tx.value.toString(),
      //     confirmations,
      //     error: `Transaction not sent to master wallet. Expected: ${this.masterWalletAddress}, Got: ${tx.to}`
      //   };
      // }


      return await this.verifyERC20Transfer(tx, receipt, confirmations);
      // Check if it's an ETH transfer or ERC20 token transfer
      // if (tx.data === '0x' || tx.data === '') {
      //   // ETH transfer
      //   logger.info(`Deposit transaction ${txHash} is a direct ETH transfer to master wallet: ${this.masterWalletAddress}`);
      //   return {
      //     isValid: true,
      //     txHash,
      //     from: tx.from || '',
      //     to: tx.to || '',
      //     value: tx.value.toString(),
      //     confirmations,
      //     tokenAddress: '0x0000000000000000000000000000000000000000',
      //     tokenAmount: tx.value.toString()
      //   };
      // } else {
      //   // Potential ERC20 transfer - parse logs

      //   return await this.verifyERC20Transfer(tx, receipt, confirmations);
      // }

    } catch (error) {
      logger.error('Error verifying deposit:', error);
      return {
        isValid: false,
        txHash,
        from: '',
        to: '',
        value: '0',
        confirmations: 0,
        error: error instanceof Error ? error.message : 'Unknown verification error'
      };
    }
  }

  /**
   * Verify ERC20 token transfer by parsing transaction logs
   */
  private async verifyERC20Transfer(
    tx: ethers.TransactionResponse, 
    receipt: ethers.TransactionReceipt,
    confirmations: number
  ): Promise<DepositVerification> {
    try {
      // ERC20 Transfer event signature: Transfer(address,address,uint256)
      const transferEventTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      
      // Find Transfer events in the transaction logs
      const transferLogs = receipt.logs.filter(log => 
        log.topics[0] === transferEventTopic && 
        log.topics.length >= 3
      );

      // Look for transfers TO our master wallet
      for (const log of transferLogs) {
        const toAddress = ethers.getAddress('0x' + log.topics[2].slice(26)); // Remove padding
        
        if (toAddress.toLowerCase() === this.masterWalletAddress) {
          // Parse the amount from log data
          logger.info(`Found ERC20 transfer to master wallet: ${this.masterWalletAddress}, log: ${JSON.stringify(log)}`);
          const amount = ethers.getBigInt(log.data);
          logger.info(`Deposit transaction ${tx.hash} is a valid ERC20 transfer to master wallet: ${this.masterWalletAddress}, amount: ${amount.toString()}`);
          
          return {
            isValid: true,
            txHash: tx.hash,
            from: tx.from || '',
            to: toAddress,
            value: tx.value.toString(),
            confirmations,
            tokenAddress: log.address,
            tokenAmount: amount.toString()
          };
        }
      }

      return {
        isValid: false,
        txHash: tx.hash,
        from: tx.from || '',
        to: tx.to || '',
        value: tx.value.toString(),
        confirmations,
        error: 'No valid ERC20 transfer to master wallet found in transaction logs'
      };

    } catch (error) {
      logger.error('Error parsing ERC20 transfer:', error);
      return {
        isValid: false,
        txHash: tx.hash,
        from: tx.from || '',
        to: tx.to || '',
        value: tx.value.toString(),
        confirmations,
        error: 'Failed to parse ERC20 transfer data'
      };
    }
  }

  /**
   * Check if a transaction hash has already been processed to prevent double-spending
   */
  async isTransactionAlreadyProcessed(txHash: string): Promise<boolean> {
    const { prisma } = await import('../database/connection');
    
    const existingDeposit = await prisma.deposit.findUnique({
      where: { txHash }
    });

    return existingDeposit !== null;
  }

  /**
   * Get token information from contract
   */
  async getTokenInfo(tokenAddress: string): Promise<{ symbol: string; decimals: number } | null> {
    try {
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        return { symbol: 'ETH', decimals: 18 };
      }

      // Arbitrum One token addresses (case-insensitive comparison)
      const lowerAddress = tokenAddress.toLowerCase();
      
      if (lowerAddress === '0xaf88d065e77c8cc2239327c5edb3a432268e5831') {
        return { symbol: 'USDC', decimals: 6 };
      }

      if (lowerAddress === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1') {
        return { symbol: 'WETH', decimals: 18 };
      }

      if (lowerAddress === '0x6314c31a7a1652ce482cffe247e9cb7c3f4bb9af') {
        return { symbol: '1INCH', decimals: 18 };
      }

      if (lowerAddress === '0x912ce59144191c1204e64559fe8253a0e49e6548') {
        return { symbol: 'ARB', decimals: 18 };
      }

      if (lowerAddress === '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f') {
        return { symbol: 'WBTC', decimals: 8 };
      }

      if (lowerAddress === '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1') {
        return { symbol: 'DAI', decimals: 18 };
      }

      // Mainnet fallbacks
      if (tokenAddress === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48') {
        return { symbol: 'USDC', decimals: 6 };
      }

      if (tokenAddress === '0xdac17f958d2ee523a2206206994597c13d831ec7') {
        return { symbol: 'USDT', decimals: 6 };
      }

      const provider = this.blockchainService.getProvider();
      
      // ERC20 contract ABI for symbol and decimals
      const erc20Abi = [
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)'
      ];

      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      
      const [symbol, decimalsResult] = await Promise.all([
        contract.symbol(),
        contract.decimals()
      ]);

      // Convert decimals to proper number (BigNumber -> number)
      const decimals = Number(decimalsResult);

      logger.info(`Retrieved token info for ${tokenAddress}: ${symbol}, ${decimals} decimals`);

      return { symbol, decimals };
    } catch (error) {
      logger.error(`Error getting token info for ${tokenAddress}:`, error);
      return null;
    }
  }
} 