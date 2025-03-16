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
    metamask: WalletState;
    phantom: WalletState;
  };
  onConnectMetamask: () => void;
  onConnectPhantom: () => void;
}

export const CryptoWallet: React.FC<CryptoWalletProps> = ({
  walletStates,
  onConnectMetamask,
  onConnectPhantom,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Crypto Wallets</h3>
      <div className="space-y-4">
        {/* MetaMask Wallet */}
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
                  <path
                    d="M34.5333 3.5L22.3333 13.3667L25.1333 7.03333L34.5333 3.5Z"
                    fill="#E17726"
                  />
                  <path
                    d="M5.4668 3.5L17.5335 13.4667L14.8668 7.03333L5.4668 3.5Z"
                    fill="#E27625"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">MetaMask</h4>
                {walletStates.metamask.address && (
                  <p className="text-sm text-gray-500">
                    {walletStates.metamask.address.slice(0, 6)}...
                    {walletStates.metamask.address.slice(-4)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onConnectMetamask}
              disabled={!walletStates.metamask.isAvailable}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                walletStates.metamask.isConnected
                  ? 'bg-green-100 text-green-700'
                  : walletStates.metamask.isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {walletStates.metamask.isConnected
                ? 'Connected'
                : walletStates.metamask.isAvailable
                ? 'Connect'
                : 'Not Available'}
            </button>
          </div>
          {walletStates.metamask.error && (
            <p className="mt-2 text-sm text-red-600">{walletStates.metamask.error}</p>
          )}
        </div>

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
