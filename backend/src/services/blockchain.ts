import { ethers } from 'ethers';
import { config } from '../config/env';
import { EncryptionService } from '../utils/encryption';
import { logger } from '../utils/logger';

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(config.RPC_URL);
    
    // Initialize wallet (decrypt private key if encrypted)
    let privateKey = config.MASTER_PRIVATE_KEY;
    if (privateKey.startsWith('encrypted:')) {
      privateKey = EncryptionService.decrypt(privateKey.replace('encrypted:', ''));
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    logger.info(`Master wallet initialized: ${this.wallet.address}`);
  }

  /**
   * Get the provider instance
   */
  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * Get the master wallet address
   */
  getMasterAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get the current chain ID
   */
  async getChainId(): Promise<number> {
    return await this.provider.getNetwork().then(network => Number(network.chainId));
  }

  /**
   * Get ETH balance for an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  /**
   * Get ERC20 token balance for an address
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const abi = ['function balanceOf(address owner) view returns (uint256)'];
      const contract = new ethers.Contract(tokenAddress, abi, this.provider);
      const balance = await contract.balanceOf(walletAddress);
      return balance.toString();
    } catch (error) {
      logger.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }

  /**
   * Send a transaction
   */
  async sendTransaction(txData: {
    to: string;
    data?: string;
    value?: string | bigint;
    gasLimit?: string | bigint;
    gasPrice?: string | bigint;
  }): Promise<string> {
    try {
      const tx = await this.wallet.sendTransaction({
        to: txData.to,
        data: txData.data || '0x',
        value: txData.value || 0,
        gasLimit: txData.gasLimit,
        gasPrice: txData.gasPrice,
      });

      logger.info(`Transaction sent: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      logger.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.waitForTransaction(txHash);
    } catch (error) {
      logger.error('Error waiting for transaction:', error);
      throw new Error('Failed to wait for transaction');
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice?.toString() || '0';
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw new Error('Failed to get gas price');
    }
  }
} 