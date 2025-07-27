# Hypervest Frontend - Arbitrum One Network

This frontend application has been configured to work exclusively with the Arbitrum One network for optimal DeFi trading performance.

## Network Configuration

- **Default Network**: Arbitrum One (Chain ID: 42161)
- **RPC URL**: https://arb1.arbitrum.io/rpc
- **Explorer**: https://arbiscan.io
- **Backend API**: http://192.168.1.5:3000

## Key Features

### Wallet Connection
- **MetaMask Integration**: Seamless connection with MetaMask wallet
- **Network Validation**: Automatic detection and warning for incorrect networks
- **Arbitrum One Focus**: Optimized for Arbitrum One's low fees and high performance

### Supported Tokens (Arbitrum One)
- **USDC**: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- **USDT**: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`
- **WETH**: `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1`
- **ETH**: Native currency

### Trading Features
- **Smart DCA++**: Drawdown-aware laddered buying via 1inch Limit Orders
- **TWAP Executor**: Time-weighted average price execution with adaptive slippage protection
- **Options Hooks**: Advanced on-chain options strategies
- **1inch Fusion+ Execution**: Optimal price execution with MEV protection

## Development

### Prerequisites
- Node.js 18+
- MetaMask wallet with Arbitrum One network configured

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Network Setup

### Adding Arbitrum One to MetaMask
1. Open MetaMask
2. Go to Settings > Networks > Add Network
3. Add the following details:
   - **Network Name**: Arbitrum One
   - **RPC URL**: https://arb1.arbitrum.io/rpc
   - **Chain ID**: 42161
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: https://arbiscan.io

### Getting Test ETH
- Use Arbitrum One's native bridge: https://bridge.arbitrum.io/
- Or use a faucet for testnet (if available)

## API Integration

The frontend is configured to communicate with the backend API deployed at:
`http://192.168.1.5:3000`

All API calls are routed through the `apiService` in `src/services/api.ts` with proper authentication headers.

## Security Features

- **Wallet Authentication**: Secure nonce-based authentication
- **Network Validation**: Ensures users are on the correct network
- **Transaction Verification**: On-chain verification for all deposits
- **MEV Protection**: 1inch Fusion+ integration for optimal execution

## Architecture

```
src/
├── config/
│   └── api.ts          # API and network configuration
├── services/
│   └── api.ts          # API service layer
├── components/
│   └── WalletConnection.tsx  # Wallet connection with network validation
├── wagmi.ts            # Wagmi configuration for Arbitrum One
└── App.tsx             # Main application component
```

## Testing

Run the test suite to verify API connectivity:
```bash
node api.js
```

This will test all endpoints against the deployed backend on Arbitrum One network.

## Deployment

The application is ready for production deployment with:
- Arbitrum One network integration
- Backend API connectivity
- Wallet authentication
- Trading strategy execution

All operations are optimized for Arbitrum One's low gas fees and high throughput. 