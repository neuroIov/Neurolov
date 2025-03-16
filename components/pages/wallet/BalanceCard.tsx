import React from 'react';
import Image from 'next/image';

interface BalanceCardProps {
  balance: number;
  currency?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, currency = 'NLOV' }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Current Balance</h3>
          <div className="flex items-center mt-2">
            <span className="text-3xl font-bold">{balance.toFixed(2)}</span>
            <span className="ml-2 text-gray-600">{currency}</span>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-full">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
