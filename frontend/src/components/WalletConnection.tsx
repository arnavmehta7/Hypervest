import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react';

export function WalletConnection() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span className="font-medium">{formatAddress(address)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-[#181e29]/90 backdrop-blur-xl rounded-xl shadow-2xl border border-cyan-400/20 z-50">
            <div className="p-4 border-b border-gray-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Connected to</span>
                <span className="text-sm font-medium text-emerald-400">
                  {chain?.name || 'Unknown Network'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-gray-200">{formatAddress(address)}</span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-cyan-900/30 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isPending}
        className="flex items-center space-x-2 border-2 border-[#0D1B2A] dark:border-gray-700 text-[#0D1B2A] dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-[#0D1B2A] dark:hover:bg-gray-800 hover:text-white dark:hover:text-emerald-400 transition-all disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium">
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </button>

      {showDropdown && !isConnected && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#181e29] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                  setShowDropdown(false);
                }}
                disabled={isPending}
                className="w-full flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-800 dark:text-gray-100">{connector.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}