import { prisma } from '../database/connection';
import { OneInchService } from '../services/oneinch';
import { BlockchainService } from '../services/blockchain';
import { DepositVerifierService } from '../services/depositVerifier';
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
  private depositVerifierService: DepositVerifierService;

  constructor() {
    this.oneInchService = new OneInchService();
    this.blockchainService = new BlockchainService();
    this.depositVerifierService = new DepositVerifierService();
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

      // Check completion conditions BEFORE executing
      const newTotalInvested = strategy.totalInvested.add(new Decimal(params.amountPerExecution));
      const targetTotalAmount = new Decimal(params.totalAmount);
      
      // Check if adding this execution would exceed total amount
      if (newTotalInvested.gt(targetTotalAmount)) {
        logger.info(`Strategy ${strategyId} would exceed total amount. Current: ${strategy.totalInvested}, Target: ${targetTotalAmount}, Next execution: ${params.amountPerExecution}`);
        
        // Mark strategy as completed
        await prisma.strategy.update({
          where: { id: strategyId },
          data: { status: 'COMPLETED' }
        });
        
        // Cancel this execution
        await prisma.strategyExecution.update({
          where: { id: execution.id },
          data: {
            status: 'CANCELLED',
            error: 'Strategy completed - total amount reached'
          }
        });
        
        logger.info(`Strategy ${strategyId} marked as COMPLETED - total amount reached`);
        return;
      }
      
      // Check if max executions limit is reached
      if (params.maxExecutions) {
        const completedExecutions = await prisma.strategyExecution.count({
          where: {
            strategyId,
            status: 'COMPLETED'
          }
        });
        
        if (completedExecutions >= params.maxExecutions) {
          logger.info(`Strategy ${strategyId} reached max executions limit: ${completedExecutions}/${params.maxExecutions}`);
          
          // Mark strategy as completed
          await prisma.strategy.update({
            where: { id: strategyId },
            data: { status: 'COMPLETED' }
          });
          
          // Cancel this execution
          await prisma.strategyExecution.update({
            where: { id: execution.id },
            data: {
              status: 'CANCELLED',
              error: 'Strategy completed - max executions reached'
            }
          });
          
          logger.info(`Strategy ${strategyId} marked as COMPLETED - max executions reached`);
          return;
        }
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

      // Get token decimals for accurate amount calculation
      const tokenInfo = await this.depositVerifierService.getTokenInfo(params.fromToken);
      if (!tokenInfo) {
        throw new Error(`Failed to get token info for ${params.fromToken}`);
      }

      // Get swap transaction with correct decimals
      const swapTx = await this.oneInchService.getSwap({
        src: params.fromToken,
        dst: params.toToken,
        amount: this.parseAmount(params.amountPerExecution, tokenInfo.decimals),
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
          txHash, // Main swap transaction hash
          toAmount: new Decimal(actualReceivedAmount),
        },
      });

      // Create Transaction records for both swap and transfer for comprehensive tracking
      await Promise.all([
        // Swap transaction record
        prisma.transaction.create({
          data: {
            userId: strategy.userId,
            type: 'STRATEGY_EXECUTION',
            txHash,
            fromToken: params.fromToken,
            toToken: params.toToken,
            fromAmount: new Decimal(params.amountPerExecution),
            toAmount: new Decimal(actualReceivedAmount),
            status: 'CONFIRMED',
          },
        }),
        // Transfer transaction record  
        prisma.transaction.create({
          data: {
            userId: strategy.userId,
            type: 'STRATEGY_EXECUTION',
            txHash: userTransferTxHash,
            fromToken: params.toToken, // Transfer is from master wallet to user
            toToken: params.toToken,   // Same token
            fromAmount: new Decimal(actualReceivedAmount),
            toAmount: new Decimal(actualReceivedAmount),
            status: 'CONFIRMED',
          },
        }),
      ]);

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
          nextExecution: this.calculateNextExecution(params.frequency, new Date()),
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
      // Get token decimals for accurate amount calculation
      const tokenInfo = await this.depositVerifierService.getTokenInfo(tokenAddress);
      if (!tokenInfo) {
        throw new Error(`Failed to get token info for ${tokenAddress}`);
      }

      const allowance = await this.oneInchService.checkAllowance(
        tokenAddress,
        this.blockchainService.getMasterAddress()
      );

      const requiredAmount = this.parseAmount(amount, tokenInfo.decimals);
      logger.info(`Allowance: ${allowance}, Required: ${requiredAmount}`);
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

  private calculateNextExecution(frequency: string, fromTime?: Date): Date {
    try {
      // Use the provided time or current time as the base
      const baseTime = fromTime || new Date();
      
      // Handle the specific case of "*/5 * * * *" (every 5 minutes) manually
      if (frequency === '*/5 * * * *') {
        const nextExecution = new Date(baseTime);
        // Add 5 minutes
        nextExecution.setMinutes(nextExecution.getMinutes() + 5);
        
        logger.info(`Calculated next execution (5min): ${nextExecution.toISOString()} from base time: ${baseTime.toISOString()}`);
        
        return nextExecution;
      }
      
      // Handle other common patterns manually
      if (frequency === '0 0 * * *') { // Daily at midnight
        const nextExecution = new Date(baseTime);
        nextExecution.setDate(nextExecution.getDate() + 1);
        nextExecution.setHours(0, 0, 0, 0);
        return nextExecution;
      }
      
      if (frequency === '0 0 */7 * *') { // Weekly
        const nextExecution = new Date(baseTime);
        nextExecution.setDate(nextExecution.getDate() + 7);
        return nextExecution;
      }
      
      // For now, fallback to 5 minutes for any unrecognized pattern
      logger.warn(`Unrecognized frequency pattern: ${frequency}, defaulting to 5 minutes`);
      const fallback = new Date(baseTime);
      fallback.setMinutes(fallback.getMinutes() + 5);
      
      logger.info(`Using fallback next execution: ${fallback.toISOString()}`);
      return fallback;
      
    } catch (error) {
      logger.error('Error calculating next execution:', error);
      // Fallback to 5 minutes from now if calculation fails
      const fallback = fromTime || new Date();
      fallback.setMinutes(fallback.getMinutes() + 5);
      logger.warn(`Using error fallback next execution: ${fallback.toISOString()}`);
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