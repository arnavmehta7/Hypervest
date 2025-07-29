<!-- # 1inch Portfolio API Integration Setup

This project now includes integration with the 1inch Portfolio API to display real-time token balances.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://192.168.1.10:3000

# 1inch API Configuration
VITE_ONEINCH_API_KEY=your_1inch_api_key_here

# Optional: Override default 1inch API endpoint
# VITE_ONEINCH_BASE_URL=https://api.1inch.dev
```

## Getting a 1inch API Key

1. Visit [1inch Developer Portal](https://portal.1inch.dev/)
2. Sign up for an account
3. Create a new API key
4. Add your API key to the environment variables

## Features

- **Real-time Token Balances**: Fetches token balances directly from 1inch Portfolio API
- **Non-zero Balance Filtering**: Only displays tokens with actual balances
- **Auto-refresh**: Balances update every 30 seconds
- **Manual Refresh**: Click the refresh button to update immediately
- **Token Information**: Shows token symbol, name, balance, and USD value
- **Responsive Design**: Works on desktop and mobile devices

## Supported Networks

Currently configured for:
- Arbitrum One (Chain ID: 42161)

## Token Support

The integration fetches balances for common tokens:
- USDC: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- USDT: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`
- WETH: `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1`

Additional tokens can be added in `frontend/src/config/api.ts`.

## API Endpoints Used

- Balance endpoint: `GET /balance/v1.2/{chainId}/balances/{address}`
- Token info endpoint: `GET /token/v1.2/{chainId}`

## Error Handling

- Graceful fallback when API is unavailable
- Empty state when no tokens found
- Console logging for debugging
- User-friendly error messages

## Usage

1. Connect your wallet
2. Navigate to the Dashboard
3. View your token portfolio in the "Token Portfolio" section
4. Use the refresh button to update balances manually

## Rate Limits

Be aware of 1inch API rate limits. The current implementation:
- Fetches every 30 seconds automatically
- Uses efficient batch requests
- Implements proper error handling  -->