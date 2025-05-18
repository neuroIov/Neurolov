'use client';

import { useEffect } from 'react';

export const useTimeSpentTracker = (pageName: string) => {
  useEffect(() => {
    const startTime = new Date().getTime();
    
    return () => {
      const endTime = new Date().getTime();
      const timeSpent = Math.round((endTime - startTime) / 1000); // in seconds
      
      // Here you can implement the actual time tracking logic
      // For example, send this data to your analytics service
      console.log(`Time spent on ${pageName}: ${timeSpent} seconds`);
    };
  }, [pageName]);

  return null;
};

export default useTimeSpentTracker;
