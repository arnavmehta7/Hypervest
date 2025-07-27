import { prisma } from '../database/connection';
import { OneInchService } from '../services/oneinch';
import { BlockchainService } from '../services/blockchain';
import { logger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

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

      // Update execution as completed
      await prisma.strategyExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          txHash,
          gasUsed: new Decimal(receipt.gasUsed.toString()),
          gasPrice: new Decimal(receipt.gasPrice?.toString() || '0'),
        },
      });

      // Update strategy totals
      await prisma.strategy.update({
        where: { id: strategyId },
        data: {
          totalInvested: {
            increment: new Decimal(params.amountPerExecution),
          },
          nextExecution: this.calculateNextExecution(params.frequency),
        },
      });

      // Update user balances
      await this.updateUserBalances(
        strategy.userId,
        params.fromToken,
        params.toToken,
        params.amountPerExecution,
        receipt
      );

      logger.info(`DCA execution completed: ${execution.id}, tx: ${txHash}`);
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
    // Simple implementation - in production, use a proper cron parser
    const now = new Date();
    const parts = frequency.split(' ');
    
    if (parts.length >= 5) {
      // Daily execution (0 0 * * *)
      if (parts[0] === '0' && parts[1] === '0') {
        now.setDate(now.getDate() + 1);
        now.setHours(0, 0, 0, 0);
        return now;
      }
      // Hourly execution (0 * * * *)
      if (parts[0] === '0' && parts[1] === '*') {
        now.setHours(now.getHours() + 1, 0, 0, 0);
        return now;
      }
    }

    // Default to 1 hour from now
    now.setHours(now.getHours() + 1);
    return now;
  }

  private async updateUserBalances(
    userId: string,
    fromToken: string,
    toToken: string,
    fromAmount: string,
    receipt: any
  ): Promise<void> {
    try {
      // Deduct from token balance
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

      // Note: In a real implementation, you'd need to calculate the received amount
      // from the transaction logs or get it from 1inch API response
      
      logger.info(`Updated balances for user ${userId} after DCA execution`);
    } catch (error) {
      logger.error('Error updating user balances:', error);
      throw error;
    }
  }
} 