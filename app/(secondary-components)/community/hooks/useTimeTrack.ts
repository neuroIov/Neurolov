'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimeSpentTrackerOptions {
  targetDuration: number; // in seconds
  messageType: string;
  onComplete: () => void;
}

export const useTimeSpentTracker = ({
  targetDuration,
  messageType,
  onComplete,
}: TimeSpentTrackerOptions) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Calculate progress percentage
  const progress = Math.min(100, (timeSpent / targetDuration) * 100);

  // Reset tracker
  const resetTimeSpent = useCallback(() => {
    setTimeSpent(0);
    setIsComplete(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  // Handle completion
  useEffect(() => {
    if (timeSpent >= targetDuration && !isComplete) {
      setIsComplete(true);
      onComplete();
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [timeSpent, targetDuration, isComplete, onComplete, intervalId]);

  // Start tracking time when component mounts
  useEffect(() => {
    if (!intervalId && !isComplete) {
      const id = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId, isComplete]);

  return {
    timeSpent,
    isComplete,
    progress,
    resetTimeSpent,
  };
};

export default useTimeSpentTracker;
