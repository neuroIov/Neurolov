import React from 'react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'earning' | 'received';
  amount: number;
  timestamp: Date;
  source: string;
  status: 'completed' | 'pending' | 'failed';
  details?: {
    modelName?: string;
    gpuHours?: number;
  };
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy HH:mm');
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    if (type === 'earning') {
      return (
        <svg
          className="w-6 h-6 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-6 h-6 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Transaction History</h3>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gray-50 p-2 rounded-full">
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">
                      {transaction.type === 'earning' ? 'Earned' : 'Received'}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {transaction.source}
                    {transaction.details?.modelName &&
                      ` • ${transaction.details.modelName}`}
                    {transaction.details?.gpuHours &&
                      ` • ${transaction.details.gpuHours} GPU hours`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'earning' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {transaction.type === 'earning' ? '+' : ''}{transaction.amount} NLOV
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
