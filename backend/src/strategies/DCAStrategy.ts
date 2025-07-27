import { prisma } from '../database/connection';
import { OneInchService } from '../services/oneinch';
import { BlockchainService } from '../services/blockchain';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';
import { ethers } from 'ethers';

const cronParser = require('cron-parser');

export interface DCAParameters {
  fromToken: string;
  toToken: string;
  amountPerExecution: string;
  frequency: string; // Cron expression
  totalAmount: string;
  slippage: number;
  maxExecutions?: number;
}

export class DCAStrategy {
  private oneInchService: OneInchService;
  private blockchainService: BlockchainService;

  constructor() {
    this.oneInchService = new OneInchService();
    this.blockchainService = new BlockchainService();
  }

  async createStrategy(userId: string, name: string, parameters: DCAParameters): Promise<string> {
    try {
      // Validate parameters
      await this.validateParameters(parameters);

      // Get user to validate wallet address
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
      });

      if (!user || !user.walletAddress || !ethers.isAddress(user.walletAddress)) {
        throw new Error('User does not have a valid wallet address');
      }

      // Check if user has sufficient balance
      const userBalance = await prisma.balance.findUnique({
        where: {
          userId_tokenAddress: {
            userId,
            tokenAddress: parameters.fromToken,
          },
        },
      });

      if (!userBalance || userBalance.amount.lt(new Decimal(parameters.totalAmount))) {
        logger.error(`Insufficient balance for DCA strategy: ${userId} - ${parameters.totalAmount}`);
        throw new Error('Insufficient balance for DCA strategy');
      }

      // Lock the required amount
      const lockedAmount = userBalance.lockedAmount.add(new Decimal(parameters.totalAmount));
      await prisma.balance.update({
        where: { id: userBalance.id },
        data: { lockedAmount },
      });

      // Create strategy
      const strategy = await prisma.strategy.create({
        data: {
          userId,
          name,
          type: 'DCA',
          status: 'ACTIVE',
          parameters: parameters as any,
          frequency: parameters.frequency,
          nextExecution: this.calculateNextExecution(parameters.frequency),
        },
      });

      logger.info(`DCA strategy created: ${strategy.id} for user ${userId}`);
      return strategy.id;
    } catch (error) {
      logger.error('Error creating DCA strategy:', error);
      throw error;
    }
  }

  async executeStrategy(strategyId: string): Promise<void> {
    const execution = await prisma.strategyExecution.create({
      data: {
        strategyId,
        status: 'PENDING',
        fromToken: '',
        toToken: '',
        fromAmount: new Decimal(0),
      },
    });

    try {
      const strategy = await prisma.strategy.findUnique({
        where: { id: strategyId },
        include: { user: true },
      });

      if (!strategy || strategy.status !== 'ACTIVE') {
        throw new Error('Strategy not found or not active');
      }

      const params = strategy.parameters as unknown as DCAParameters;
      
      // Validate user wallet address
      if (!strategy.user.walletAddress || !ethers.isAddress(strategy.user.walletAddress)) {
        throw new Error('Invalid user wallet address');
      }

      // Update execution with token details
      await prisma.strategyExecution.update({
        where: { id: execution.id },
        data: {
          status: 'EXECUTING',
          fromToken: params.fromToken,
          toToken: params.toToken,
          fromAmount: new Decimal(params.amountPerExecution),
        },
      });

      // Check allowance and approve if necessary
      await this.ensureAllowance(params.fromToken, params.amountPerExecution);

      // Get swap transaction
      const swapTx = await this.oneInchService.getSwap({
        src: params.fromToken,
        dst: params.toToken,
        amount: this.parseAmount(params.amountPerExecution, 18), // Assume 18 decimals
        from: this.blockchainService.getMasterAddress(),
        slippage: params.slippage,
      });

      // Execute transaction
      const txHash = await this.blockchainService.sendTransaction({
        to: swapTx.to,
        data: swapTx.data,
        value: swapTx.value,
        gasLimit: swapTx.gas,
        gasPrice: swapTx.gasPrice,
      });

      // Wait for confirmation
      const receipt = await this.blockchainService.waitForTransaction(txHash);
      
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // Parse transaction logs to get actual received amount
      const actualReceivedAmount = await this.parseSwapReceivedAmount(
        receipt,
        params.toToken,
        this.blockchainService.getMasterAddress()
      );

      // Transfer received tokens to user's wallet
      let userTransferTxHash: string;
      try {
        userTransferTxHash = await this.transferTokensToUser(
          strategy.user.walletAddress,
          params.toToken,
          actualReceivedAmount
        );
      } catch (transferError) {
        logger.error('Failed to transfer tokens to user wallet:', transferError);
        
        // Mark execution as partially completed (swap succeeded but transfer failed)
        await prisma.strategyExecution.update({
          where: { id: execution.id },
          data: {
            status: 'FAILED',
            error: `Swap completed but transfer failed: ${transferError instanceof Error ? transferError.message : 'Unknown error'}`,
            txHash,
            toAmount: new Decimal(actualReceivedAmount),
          },
        });
        
        // Tokens are stuck in master wallet - this needs manual intervention
        logger.error(`URGENT: Tokens stuck in master wallet for user ${strategy.userId}. Amount: ${actualReceivedAmount} of token ${params.toToken}`);
        throw new Error('Swap completed but token transfer to user wallet failed');
      }

      // Update execution as completed
      await prisma.strategyExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          txHash,
          toAmount: new Decimal(actualReceivedAmount),
          // Remove gas tracking since gas is sponsored
        },
      });

      // Update strategy totals
      await prisma.strategy.update({
        where: { id: strategyId },
        data: {
          totalInvested: {
            increment: new Decimal(params.amountPerExecution),
          },
          totalReceived: {
            increment: new Decimal(actualReceivedAmount),
          },
          nextExecution: this.calculateNextExecution(params.frequency),
        },
      });

      // Update user balances (only deduct from locked amount since tokens are transferred to user wallet)
      await this.updateUserBalances(
        strategy.userId,
        params.fromToken,
        params.amountPerExecution
      );

      logger.info(`DCA execution completed: ${execution.id}, swap tx: ${txHash}, transfer tx: ${userTransferTxHash}`);
    } catch (error) {
      logger.error(`DCA execution failed: ${execution.id}`, error);
      
      await prisma.strategyExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
          retryCount: { increment: 1 },
        },
      });

      throw error;
    }
  }

  private async validateParameters(params: DCAParameters): Promise<void> {
    if (!params.fromToken || !params.toToken) {
      throw new Error('From and to tokens are required');
    }

    if (parseFloat(params.amountPerExecution) <= 0) {
      throw new Error('Amount per execution must be positive');
    }

    if (parseFloat(params.totalAmount) <= 0) {
      throw new Error('Total amount must be positive');
    }

    if (params.slippage < 0.1 || params.slippage > 50) {
      throw new Error('Slippage must be between 0.1% and 50%');
    }

    // Validate cron expression (basic validation)
    if (!/^[\d\*\-\,\/\s]+$/.test(params.frequency)) {
      throw new Error('Invalid frequency format');
    }
  }

  private async ensureAllowance(tokenAddress: string, amount: string): Promise<void> {
    try {
      const allowance = await this.oneInchService.checkAllowance(
        tokenAddress,
        this.blockchainService.getMasterAddress()
      );

      const requiredAmount = this.parseAmount(amount, 18);
      if (BigInt(allowance) < BigInt(requiredAmount)) {
        const approveTx = await this.oneInchService.getApproveTransaction(tokenAddress);
        await this.blockchainService.sendTransaction({
          to: approveTx.to,
          data: approveTx.data,
          value: approveTx.value,
          gasLimit: approveTx.gas,
          gasPrice: approveTx.gasPrice,
        });
      }
    } catch (error) {
      logger.error('Error ensuring allowance:', error);
      throw new Error('Failed to approve token spending');
    }
  }

  private parseAmount(amount: string, decimals: number): string {
    return (parseFloat(amount) * Math.pow(10, decimals)).toString();
  }

  private calculateNextExecution(frequency: string): Date {
    try {
      // Use proper cron parser library instead of manual parsing
      const interval = cronParser.parseExpression(frequency, {
        currentDate: new Date(),
        tz: 'UTC'
      });
      return interval.next().toDate();
    } catch (error) {
      logger.error('Error parsing cron expression:', error);
      // Fallback to 1 hour from now if cron parsing fails
      const fallback = new Date();
      fallback.setHours(fallback.getHours() + 1);
      return fallback;
    }
  }

  /**
   * Parse transaction logs to get actual received amount from swap
   */
  private async parseSwapReceivedAmount(
    receipt: ethers.TransactionReceipt,
    toToken: string,
    masterAddress: string
  ): Promise<string> {
    try {
      // Normalize addresses for comparison
      const normalizedMasterAddress = masterAddress.toLowerCase();
      const normalizedToToken = toToken.toLowerCase();
      
      // Check if it's ETH (native token)
      const isETH = normalizedToToken === '0x0000000000000000000000000000000000000000' || 
                    normalizedToToken === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

      if (isETH) {
        return await this.parseETHReceived(receipt, normalizedMasterAddress);
      } else {
        return await this.parseERC20Received(receipt, normalizedToToken, normalizedMasterAddress);
      }
    } catch (error) {
      logger.error('Error parsing swap received amount:', error);
      throw new Error('Failed to parse received amount from transaction');
    }
  }

  /**
   * Parse ETH received from swap transaction
   */
  private async parseETHReceived(
    receipt: ethers.TransactionReceipt,
    masterAddress: string
  ): Promise<string> {
    // WETH Withdrawal event: Withdrawal(address indexed src, uint wad)
    const wethWithdrawalInterface = new ethers.Interface([
      'event Withdrawal(address indexed src, uint256 wad)'
    ]);

    // WETH contract addresses for different networks
    const wethAddresses = [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Mainnet WETH
      '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', // Sepolia WETH
      '0xb4fbf271143f4fbf0b4f4d67c7e0d5d3f8c13fb8',  // Görli WETH (backup)
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Base WETH
    ];

    // Look for WETH withdrawal events
    for (const log of receipt.logs) {
      try {
        // Check if this log is from a WETH contract
        if (wethAddresses.includes(log.address.toLowerCase())) {
          const parsedLog = wethWithdrawalInterface.parseLog({
            topics: log.topics,
            data: log.data
          });

          if (parsedLog && parsedLog.name === 'Withdrawal') {
            const withdrawalAddress = parsedLog.args.src.toLowerCase();
            if (withdrawalAddress === masterAddress) {
              return parsedLog.args.wad.toString();
            }
          }
        }
      } catch (parseError) {
        // Skip logs that don't match WETH withdrawal format
        continue;
      }
    }

    // Fallback: look for internal ETH transfers in transaction traces
    // This would require trace_transaction RPC call, which is more complex
    logger.warn('No WETH withdrawal found, ETH amount calculation may be inaccurate');
    return '0';
  }

  /**
   * Parse ERC20 tokens received from swap transaction
   */
  private async parseERC20Received(
    receipt: ethers.TransactionReceipt,
    tokenAddress: string,
    masterAddress: string
  ): Promise<string> {
    // ERC20 Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
    const transferInterface = new ethers.Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ]);

    let totalReceived = BigInt(0);

    // Parse all Transfer events for the target token
    for (const log of receipt.logs) {
      try {
        // Only process logs from the target token contract
        if (log.address.toLowerCase() !== tokenAddress) {
          continue;
        }

        const parsedLog = transferInterface.parseLog({
          topics: log.topics,
          data: log.data
        });

        if (parsedLog && parsedLog.name === 'Transfer') {
          const toAddress = parsedLog.args.to.toLowerCase();
          
          // Sum up all transfers TO our master address
          if (toAddress === masterAddress) {
            totalReceived += BigInt(parsedLog.args.value.toString());
          }
        }
      } catch (parseError) {
        // Skip logs that don't match Transfer event format
        continue;
      }
    }

    if (totalReceived === BigInt(0)) {
      throw new Error(`No ${tokenAddress} transfers found to master address`);
    }

    return totalReceived.toString();
  }

  /**
   * Transfer tokens from master wallet to user's wallet
   */
  private async transferTokensToUser(
    userWalletAddress: string,
    tokenAddress: string,
    amount: string
  ): Promise<string> {
    try {
      logger.info(`Transferring ${amount} of ${tokenAddress} to user wallet: ${userWalletAddress}`);

      // Check if it's ETH (native token)
      if (tokenAddress === '0x0000000000000000000000000000000000000000' || 
          tokenAddress === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        
        // ETH transfer
        const txHash = await this.blockchainService.sendTransaction({
          to: userWalletAddress,
          value: amount,
          data: '0x',
        });

        // Wait for confirmation
        await this.blockchainService.waitForTransaction(txHash, 1);
        return txHash;

      } else {
        // ERC20 token transfer using ethers.js Interface (cleaner approach)
        const erc20Interface = new ethers.Interface([
          'function transfer(address to, uint256 amount) returns (bool)'
        ]);
        
        const transferData = erc20Interface.encodeFunctionData('transfer', [
          userWalletAddress,
          amount
        ]);
        
        const txHash = await this.blockchainService.sendTransaction({
          to: tokenAddress,
          data: transferData,
          value: '0',
        });

        // Wait for confirmation
        await this.blockchainService.waitForTransaction(txHash, 1);
        return txHash;
      }
    } catch (error) {
      logger.error('Error transferring tokens to user:', error);
      throw new Error('Failed to transfer tokens to user wallet');
    }
  }

  private async updateUserBalances(
    userId: string,
    fromToken: string,
    fromAmount: string
  ): Promise<void> {
    try {
      // Only deduct from token balance and locked amount since tokens are transferred directly to user
      await prisma.balance.update({
        where: {
          userId_tokenAddress: {
            userId,
            tokenAddress: fromToken,
          },
        },
        data: {
          amount: { decrement: new Decimal(fromAmount) },
          lockedAmount: { decrement: new Decimal(fromAmount) },
        },
      });

      // Note: We don't add to destination token balance since tokens go directly to user's wallet
      // The user's external wallet balance will be updated, but our internal tracking doesn't need to
      
      logger.info(`Updated balances for user ${userId} after DCA execution`);
    } catch (error) {
      logger.error('Error updating user balances:', error);
      throw error;
    }
  }
} 