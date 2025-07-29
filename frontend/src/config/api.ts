// API Configuration
export const API_CONFIG = {
  BASE_URL: fetch(`${import.meta.env.VITE_API_BASE_URL}`),
  ENDPOINTS: {
    AUTH: {
      NONCE: '/api/auth/nonce',
      AUTHENTICATE: '/api/auth/authenticate',
      PROFILE: '/api/auth/profile',
      REFRESH_NONCE: '/api/auth/refresh-nonce',
    },
    WALLET: {
      DEPOSIT_ADDRESS: '/api/wallet/deposit-address',
      BALANCES: '/api/wallet/balances',
      DEPOSITS: '/api/wallet/deposits',
      WITHDRAW: '/api/wallet/withdraw',
      SWAP: '/api/wallet/swap',
    },
    MARKET: {
      TOKENS: '/api/market/tokens',
      GAS_PRICE: '/api/market/gas-price',
      QUOTE: '/api/market/quote',
    },
    STRATEGIES: {
      LIST: '/api/strategies',
      CREATE_DCA: '/api/strategies/dca',
      DETAILS: (id: string) => `/api/strategies/${id}`,
      PAUSE: (id: string) => `/api/strategies/${id}/pause`,
      RESUME: (id: string) => `/api/strategies/${id}/resume`,
      STOP: (id: string) => `/api/strategies/${id}/stop`,
    },
  },
};

// 1inch API Configuration
export const ONEINCH_CONFIG = {
  BASE_URL: 'https://api.1inch.dev',
  API_KEY: import.meta.env.VITE_ONEINCH_API_KEY || 'PG0QPjOuHKZ7R22Z5aPUclbNqL2Q7w6P',
  ENDPOINTS: {
    BALANCES: (chainId: number, address: string) => `/balance/v1.2/${chainId}/balances/${address}`,
    TOKENS: (chainId: number) => `/token/v1.2/${chainId}`,
  },
};

// Arbitrum One Network Configuration
export const ARBITRUM_CONFIG = {
  CHAIN_ID: 42161,
  NAME: 'Arbitrum One',
  RPC_URL: 'https://arb1.arbitrum.io/rpc',
  EXPLORER: 'https://arbiscan.io',
  NATIVE_CURRENCY: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  TOKENS: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
}; 