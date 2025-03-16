"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/app/auth/useUser';

interface DeploymentData {
  volume_identifier: string;
}

const DEV_EMAILS = ['nitishmeswal@gmail.com', 'neohex262@gmail.com', 'neurolov.ai@gmail.com', 'jprateek961@gmail.com'];

export const ModelStatus = () => {
  const [deploymentData, setDeploymentData] = useState<DeploymentData | null>(null);
  const { user } = useUser();

  const isDev = user?.email && DEV_EMAILS.includes(user.email);

  useEffect(() => {
    const checkDeploymentStatus = () => {
      // Only check deployment status for dev users
      if (!isDev) {
        setDeploymentData(null);
        localStorage.removeItem('pytorch_deployment'); // Clear any existing data for non-dev users
        return;
      }

      const storedData = localStorage.getItem('pytorch_deployment');
      if (storedData) {
        try {
          const data = JSON.parse(storedData) as DeploymentData;
          setDeploymentData(data);
        } catch (error) {
          console.error('Error parsing deployment data:', error);
          setDeploymentData(null);
        }
      } else {
        setDeploymentData(null);
      }
    };

    // Check initial status
    checkDeploymentStatus();

    // Listen for changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'pytorch_deployment') {
        checkDeploymentStatus();
      }
    });
  }, [isDev]);

  if (!isDev || !deploymentData?.volume_identifier) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-full">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm text-green-500 font-medium">
        Volume ID: {deploymentData.volume_identifier}
      </span>
    </div>
  );
};

export default ModelStatus;
