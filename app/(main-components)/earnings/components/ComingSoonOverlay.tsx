'use client';

import React from 'react';

export const ComingSoonOverlay = () => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-black/90 text-white px-8 py-6 rounded-lg max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
        <p className="text-gray-300">
          The earnings feature will be available in version 2.0. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};
