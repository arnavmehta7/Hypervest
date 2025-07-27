import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'fallback-key-change-in-production-32',

  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Blockchain
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '11155111'), // Sepolia
  RPC_URL: process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  MASTER_PRIVATE_KEY: process.env.MASTER_PRIVATE_KEY || '',
  MASTER_PUBLIC_KEY: process.env.MASTER_PUBLIC_KEY || '',

  // 1inch
  ONEINCH_API_KEY: process.env.ONEINCH_API_KEY || '',
  ONEINCH_BASE_URL: process.env.ONEINCH_BASE_URL || 'https://api.1inch.io/v5.0',

  // Security
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;

// Validation
if (config.NODE_ENV === 'production') {
  const requiredVars = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'DATABASE_URL',
    'MASTER_PRIVATE_KEY',
    'MASTER_PUBLIC_KEY',
    'ONEINCH_API_KEY',
    'RPC_URL'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
  }
} 