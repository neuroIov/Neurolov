import React, { useState, useEffect } from 'react';
import { LockIcon } from './LockIcon';

interface AnimatedLockStatusProps {
  itemName: string;
}

export const AnimatedLockStatus = ({ itemName }: AnimatedLockStatusProps) => {
  const [showName, setShowName] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowName(prev => !prev);
    }, 3000); // Switch every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full">
      <div
        className={`transition-opacity duration-500 flex items-center space-x-3 ${showName ? 'opacity-100' : 'opacity-0'}`}
      >
        <span>{itemName}</span>
        <LockIcon />
      </div>
      <div
        className={`absolute inset-0 transition-opacity duration-500 flex items-center ${showName ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="flex items-center space-x-2">
          <span className="whitespace-nowrap px-2 py-1 text-xs font-semibold rounded-full text-white bg-[#06115D]">
            COMING SOON
          </span>
          <LockIcon />
        </div>
      </div>
    </div>
  );
};
