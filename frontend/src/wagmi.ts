import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum, base } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  // chains: [mainnet, sepolia, arbitrum, base],
  connectors: [
    metaMask(),
  ],
  transports: {
    // [mainnet.id]: http(),
    [sepolia.id]: http(),
    // [arbitrum.id]: http(),
    // [base.id]: http(),
  },
});