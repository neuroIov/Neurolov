import React from 'react';
import Image from 'next/image';

interface WalletState {
  isAvailable: boolean;
  isConnected: boolean;
  address: string | null;
  error: string | null;
}

interface CryptoWalletProps {
  walletStates: {
    phantom: WalletState;
  };
  onConnectPhantom: () => void;
}

export const CryptoWallet: React.FC<CryptoWalletProps> = ({
  walletStates,
  onConnectPhantom,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Solana Wallet</h3>
      <div className="space-y-4">
        {/* Phantom Wallet */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="40" height="40" rx="8" fill="#AB9FF2" />
                  <path
                    d="M28 14H12C10.8954 14 10 14.8954 10 16V24C10 25.1046 10.8954 26 12 26H28C29.1046 26 30 25.1046 30 24V16C30 14.8954 29.1046 14 28 14Z"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Phantom</h4>
                {walletStates.phantom.address && (
                  <p className="text-sm text-gray-500">
                    {walletStates.phantom.address.slice(0, 6)}...
                    {walletStates.phantom.address.slice(-4)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onConnectPhantom}
              disabled={!walletStates.phantom.isAvailable}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                walletStates.phantom.isConnected
                  ? 'bg-green-100 text-green-700'
                  : walletStates.phantom.isAvailable
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {walletStates.phantom.isConnected
                ? 'Connected'
                : walletStates.phantom.isAvailable
                ? 'Connect'
                : 'Not Available'}
            </button>
          </div>
          {walletStates.phantom.error && (
            <p className="mt-2 text-sm text-red-600">{walletStates.phantom.error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
