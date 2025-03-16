import React from 'react';
import Image from 'next/image';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  lastFour?: string;
  expiryDate?: string;
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onSelect?: (method: PaymentMethod) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ paymentMethods, onSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Methods</h3>
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect?.(method)}
          >
            <div className="flex items-center">
              {method.type === 'card' && (
                <div className="bg-blue-50 p-2 rounded-full mr-4">
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">{method.name}</p>
                {method.lastFour && (
                  <p className="text-sm text-gray-500">
                    •••• {method.lastFour}
                    {method.expiryDate && ` - Expires ${method.expiryDate}`}
                  </p>
                )}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
