'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Coins, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EarningsData {
  currentSession: {
    duration: string;
    earnings: number;
    powerCost: number;
    netEarnings: number;
  };
  lifetimeEarnings: number;
  history: Array<{
    date: string;
    earnings: number;
  }>;
}

interface EarningsStatsProps {
  stats: EarningsData;
  onCashout: () => void;
}

export const EarningsStats: React.FC<EarningsStatsProps> = ({ stats, onCashout }) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Earnings Overview</h3>
        <Badge variant="secondary" className="font-mono">
          Active
        </Badge>
      </div>

      <div className="grid gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4" />
            <span className="text-sm">Total Earned</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stats.lifetimeEarnings}</span>
            <span className="text-sm text-muted-foreground">NLOV</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Current Session</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stats.currentSession.earnings}</span>
            <span className="text-sm text-muted-foreground">NLOV</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Session Duration</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stats.currentSession.duration}</span>
          </div>
        </div>

        <Button 
          onClick={onCashout}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Cashout Earnings
        </Button>
      </div>
    </Card>
  );
};
