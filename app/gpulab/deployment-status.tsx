"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DeploymentStatusProps {
  className?: string;
}

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ className = '' }) => {
  const [isDeployed, setIsDeployed] = useState(false);

  useEffect(() => {
    // Initial check
    checkDeploymentStatus();

    // Check every second for changes
    const interval = setInterval(checkDeploymentStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const checkDeploymentStatus = () => {
    try {
      const storedData = localStorage.getItem('pytorch_deployment');
      console.log('[Debug] Checking deployment status:', storedData);
      
      if (storedData) {
        const deploymentData = JSON.parse(storedData);
        const newStatus = !!deploymentData.volume_identifier;
        console.log('[Debug] Deployment status:', newStatus);
        setIsDeployed(newStatus);
      } else {
        setIsDeployed(false);
      }
    } catch (error) {
      console.error('[Debug] Error checking deployment status:', error);
      setIsDeployed(false);
    }
  };

  if (!isDeployed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 backdrop-blur-sm ${className}`}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
      
      {/* Glowing dots */}
      <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
      <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
      
      <div className="relative flex items-center space-x-3">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <div className="flex flex-col">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium text-blue-200"
          >
            Model Configured
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-blue-300/80"
          >
            Ready for GPU deployment
          </motion.p>
        </div>

        {/* Hexagon grid background */}
        <div className="absolute inset-0 overflow-hidden rounded-lg opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 border border-blue-500/30"
              style={{
                transform: `rotate(30deg)`,
                left: `${(i * 20) - 10}%`,
                top: `${((i % 2) * 30) - 10}%`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DeploymentStatus;
