# Hypervest Backend

Automated crypto investment platform with DCA, TWAP, and algorithmic trading strategies powered by 1inch Protocol.

## 🚀 Features

- **Wallet-Based Authentication**: Secure authentication using wallet signatures (no email/password needed)
- **Secure Fund Management**: Centralized custody with encrypted private key storage
- **DCA Strategy**: Dollar-cost averaging with customizable frequency and amounts
- **1inch Integration**: Optimal price execution via 1inch Aggregation API
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive validation and sanitization
- **Audit Trail**: Complete transaction and execution logging
- **Real-time Monitoring**: Health checks and performance metrics

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis with Bull for job processing
- **Blockchain**: Ethers.js for Ethereum interaction
- **Authentication**: Wallet signature-based authentication
- **Security**: Helmet, CORS, rate limiting, input sanitization

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- 1inch API key
- Ethereum RPC endpoint (Infura, Alchemy, etc.)

## 🔧 Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd hypervest-backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://hypervest:secure_password_123@localhost:5433/hypervest_db"

# Blockchain (Sepolia Testnet)
CHAIN_ID=11155111
RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
MASTER_PRIVATE_KEY="your-master-wallet-private-key"
MASTER_PUBLIC_KEY="your-master-wallet-address"

# 1inch API
ONEINCH_API_KEY="your-1inch-api-key"

# Security
JWT_SECRET="your-super-secure-jwt-secret"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 3. Start Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

## 📚 API Documentation

### Wallet Authentication

The API uses wallet signature-based authentication. No email/password required!

#### Get Nonce for Signing
```http
POST /api/auth/nonce
Content-Type: application/json

{
  "walletAddress": "0x742d35cc6641c8532b51aDdA77b7066bcc7E6C9C"
}
```

Response:
```json
{
  "message": "Welcome to Hypervest!\n\nPlease sign this message to authenticate your wallet.\n\nWallet: 0x742d35cc6641c8532b51aDdA77b7066bcc7E6C9C\nNonce: 0x1234...\nTimestamp: 1640995200000\n\nThis request will not trigger a blockchain transaction or cost any gas fees.",
  "nonce": "0x1234567890abcdef",
  "timestamp": 1640995200000,
  "walletAddress": "0x742d35cc6641c8532b51aDdA77b7066bcc7E6C9C"
}
```

#### Authenticate with Signature
```http
POST /api/auth/authenticate
Content-Type: application/json

{
  "walletAddress": "0x742d35cc6641c8532b51aDdA77b7066bcc7E6C9C",
  "signature": "0x...",
  "message": "Welcome to Hypervest!...",
  "timestamp": 1640995200000
}
```

Response:
```json
{
  "message": "Authentication successful",
  "user": {
    "id": "uuid",
    "walletAddress": "0x742d35cc6641c8532b51aDdA77b7066bcc7E6C9C",
    "createdAt": "2023-11-20T10:30:00.000Z"
  },
  "authToken": "base64-encoded-auth-token",
  "sessionExpiry": 1640995500000
}
```

### Protected Routes

Use the auth token in the Authorization header:

```http
Authorization: Wallet <base64-encoded-auth-token>
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Wallet <auth-token>
```

### Wallet Management

#### Get Balances
```http
GET /api/wallet/balances
Authorization: Wallet <auth-token>
```

#### Get Deposit Address
```http
GET /api/wallet/deposit-address
Authorization: Wallet <auth-token>
```

Response:
```json
{
  "address": "0x...",
  "chainId": 11155111,
  "note": "Send funds to this address. Include your user ID in the transaction memo if supported."
}
```

#### Record Deposit
```http
POST /api/wallet/deposits
Authorization: Wallet <auth-token>
Content-Type: application/json

{
  "txHash": "0x...",
  "tokenAddress": "0x...",
  "tokenSymbol": "USDC",
  "amount": "100.0"
}
```

### Strategy Management

#### Create DCA Strategy
```http
POST /api/strategies/dca
Authorization: Wallet <auth-token>
Content-Type: application/json

{
  "name": "Daily ETH DCA",
  "fromToken": "0xA0b86a33E6441944dB7cD84a6CCC4D0e54e24B65",
  "toToken": "0x0000000000000000000000000000000000000000",
  "amountPerExecution": "10.0",
  "totalAmount": "300.0",
  "frequency": "0 0 * * *",
  "slippage": 1.0
}
```

#### Get User Strategies
```http
GET /api/strategies
Authorization: Wallet <auth-token>
```

#### Pause/Resume/Stop Strategy
```http
PUT /api/strategies/{id}/pause
PUT /api/strategies/{id}/resume
PUT /api/strategies/{id}/stop
Authorization: Wallet <auth-token>
```

#### Manual Strategy Execution (Testing)
```http
POST /api/strategies/{id}/execute
Authorization: Wallet <auth-token>
```

### Market Data

#### Get Swap Quote
```http
GET /api/market/quote?fromTokenAddress=0x...&toTokenAddress=0x...&amount=100&slippage=1.0
Authorization: Wallet <auth-token>
```

#### Get Supported Tokens
```http
GET /api/market/tokens
Authorization: Wallet <auth-token>
```

#### Get Gas Price
```http
GET /api/market/gas-price
Authorization: Wallet <auth-token>
```

## 🔒 Security Features

### Wallet Authentication
- Signature-based authentication using ethers.js
- Nonce-based replay attack prevention
- Timestamp validation (5-minute window)
- Automatic nonce rotation after each authentication

### Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- Trading operations: 10 requests per minute
- General API: 100 requests per 15 minutes

### Input Validation
- All inputs are validated and sanitized
- Ethereum address validation
- Amount and numeric validation
- SQL injection prevention

### Data Protection
- Private keys encrypted at rest
- Wallet signature verification
- CORS protection
- Secure session management

## 🏗 Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Client    │───▶│ Express API  │───▶│ PostgreSQL  │
│  (Wallet)   │    │   + Auth     │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
                          │                     ▲
                          ▼                     │
                   ┌──────────────┐    ┌─────────────┐
                   │ Bull Queue   │───▶│ Strategies  │
                   │   (Redis)    │    │ Execution   │
                   └──────────────┘    └─────────────┘
                          │                     │
                          ▼                     ▼
                   ┌──────────────┐    ┌─────────────┐
                   │  1inch API   │    │ Blockchain  │
                   │             │    │  (Sepolia)  │
                   └──────────────┘    └─────────────┘
```

## 🚦 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio

# Testing
npm test            # Run tests
```

## 📊 Monitoring

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2023-11-20T10:30:00.000Z",
  "version": "1.0.0",
  "database": "connected"
}
```

### Logs
Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output in development

## 🔐 Authentication Flow

1. **Connect Wallet**: User connects their wallet (MetaMask, WalletConnect, etc.)
2. **Request Nonce**: Frontend calls `/api/auth/nonce` with wallet address
3. **Sign Message**: User signs the returned message with their wallet
4. **Authenticate**: Frontend submits signature to `/api/auth/authenticate`
5. **Use Auth Token**: Include returned auth token in subsequent API calls

## ⚠️ Security Considerations

1. **Private Key Management**: Store master private key securely, consider hardware wallets for production
2. **API Keys**: Rotate 1inch API keys regularly
3. **Database**: Use strong passwords and restrict network access
4. **Rate Limiting**: Monitor and adjust limits based on usage patterns
5. **Audit Logs**: Review transaction logs regularly for suspicious activity
6. **Signature Verification**: Validate all wallet signatures server-side
7. **Nonce Management**: Ensure nonce rotation prevents replay attacks

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running: `docker-compose ps`
   - Check DATABASE_URL in .env

2. **1inch API Errors**
   - Verify API key is valid
   - Check network connectivity
   - Ensure sufficient token allowances

3. **Authentication Failures**
   - Verify wallet signature is valid
   - Check timestamp is within 5-minute window
   - Ensure nonce matches server expectation

4. **Transaction Failures**
   - Check gas prices and limits
   - Verify token balances
   - Monitor Ethereum network status

## 📝 License

MIT License - see LICENSE file for details. 