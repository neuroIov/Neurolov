'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Thermometer } from 'lucide-react';

interface GPUStats {
  utilization: number;
  temperature: number;
  power: number;
  memory: number;
}

interface GPUMonitorProps {
  stats: GPUStats;
}

export const GPUMonitor: React.FC<GPUMonitorProps> = ({ stats }) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">GPU Performance</h3>
        <Badge variant="outline" className="font-mono">
          RTX 4090
        </Badge>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span className="text-sm">Utilization</span>
            </div>
            <span className="text-sm font-mono">{stats.utilization}%</span>
          </div>
          <Progress value={stats.utilization} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              <span className="text-sm">Temperature</span>
            </div>
            <span className="text-sm font-mono">{stats.temperature}°C</span>
          </div>
          <Progress value={(stats.temperature / 100) * 100} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Power Draw</span>
            </div>
            <span className="text-sm font-mono">{stats.power}W</span>
          </div>
          <Progress value={(stats.power / 450) * 100} />
        </div>
      </div>
    </Card>
  );
};
