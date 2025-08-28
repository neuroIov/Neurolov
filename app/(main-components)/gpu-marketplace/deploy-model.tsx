"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { GPU, gpuData } from '@/constants/values';
import { GPULabClient } from '@/app/gpulab/gpulab-service';
import { useModelBag } from '@/store/model-bag';
import { useUser } from '@/app/auth/useUser';
import { useRouter } from 'next/navigation';

const DEV_EMAILS = ['nitishmeswal@gmail.com', 'neohex262@gmail.com', 'neurolov.ai@gmail.com', 'jprateek961@gmail.com'];

interface ContainerStats {
  container_stats: {
    cpu_usage: string;
    ram_usage: string;
    total_ram: string;
    ram_percentage: string;
    status: string;
    used_volume: string;
    used_container_disk: string;
    uptime: string;
    created: string;
    total_volume: string;
    total_container_disk: string;
    used_container_disk_percentage: string;
    used_volume_percentage: string;
  };
  gpu_stats: Array<{
    memory_used: number;
    total_memory: number;
    mem_utilize_percent: string;
  }>;
}

interface DeployModelButtonProps {
  className?: string;
  gpu?: GPU;
  onDeploy?: () => void;
}

export const DeployModelButton: React.FC<DeployModelButtonProps> = ({ 
  className = '',
  gpu,
  onDeploy 
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [containerStats, setContainerStats] = useState<ContainerStats | null>(null);
  const { toast } = useToast();
  const { selectedModel } = useModelBag();
  const { user } = useUser();
  const router = useRouter();

  const isGpuAvailable = (gpuId: string) => {
    if (user?.email && DEV_EMAILS.includes(user.email)) {
      return ['rtx4090', 'rtx3090ti', 'rtx3090'].includes(gpuId);
    }
    return false;
  };

  const checkContainerStatus = async (id: string) => {
    try {
      const client = GPULabClient.getInstance();
      const status = await client.getContainerStatus(id);
      console.log('[Debug] Container status:', status);
      
      if (status?.container_stats) {
        setContainerStats(status);
      }
    } catch (error) {
      console.error('Error checking container status:', error);
      toast({
        title: "Status Check Failed",
        description: error instanceof Error ? error.message : "Failed to get container status",
        variant: "destructive",
      });
    }
  };

  const handleDeploy = async () => {
    if (!gpu) {
      toast({
        title: "No GPU Selected",
        description: "Please select a GPU option first",
        variant: "destructive",
      });
      return;
    }

    if (!isGpuAvailable(gpu.id)) {
      toast({
        title: "GPU Not Available",
        description: "This GPU is not yet available for deployment",
        variant: "destructive",
      });
      return;
    }

    if (!selectedModel) {
      toast({
        title: "No Model Selected",
        description: "Please select a model from the AI Models page first",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    
    try {
      const storedData = localStorage.getItem('pytorch_deployment');
      if (!storedData) {
        throw new Error('No deployment data found. Please deploy the model first from the AI Models page.');
      }

      const deploymentData: any = JSON.parse(storedData);
      if (!deploymentData.volume_identifier) {
        throw new Error('Invalid deployment data. Missing volume identifier.');
      }

      console.log('[Debug] Starting container deployment with volume:', deploymentData.volume_identifier);
      const client = GPULabClient.getInstance();
      const result = await client.createContainer(
        deploymentData.volume_identifier,
        gpu.name
      );

      console.log('[Debug] Container creation response:', result);

      if (result.status === 'success') {
        toast({
          title: "Container Deployment Started",
          description: "Container is being created. Check My Models section for status.",
        });
        
        // Redirect to My Models section
        router.push('/ai-models?view=my-models');
        onDeploy?.();
      }
    } catch (error) {
      console.error('Error deploying container:', error);
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Failed to deploy container",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Button
      onClick={handleDeploy}
      disabled={isDeploying || !gpu || !selectedModel || !isGpuAvailable(gpu?.id || '')}
      className={`${className} flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white`}
    >
      {isDeploying ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Deploying...
        </div>
      ) : (
        'Deploy Now'
      )}
    </Button>
  );
};

export default DeployModelButton;
