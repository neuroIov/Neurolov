'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface CashoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
}

export const CashoutDialog: React.FC<CashoutDialogProps> = ({
  open,
  onOpenChange,
  amount,
}) => {
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const availableBalance = 99999; // Example balance
  const minCashout = 100;
  const maxCashout = 1000;

  const handleCashout = () => {
    const cashoutAmountNumber = Number(cashoutAmount);
    
    if (isNaN(cashoutAmountNumber)) {
      setError('Please enter a valid number');
      return;
    }

    if (cashoutAmountNumber < minCashout) {
      setError(`Minimum cashout amount is ${minCashout} NLOV`);
      return;
    }

    if (cashoutAmountNumber > maxCashout) {
      setError(`Maximum cashout amount is ${maxCashout} NLOV`);
      return;
    }

    if (cashoutAmountNumber > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    setProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cashout NLOV Tokens</DialogTitle>
          <DialogDescription>
            Convert your mining rewards to NLOV tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold">{availableBalance} NLOV</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="amount">Cashout Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={cashoutAmount}
              onChange={(e) => {
                setCashoutAmount(e.target.value);
                setError('');
              }}
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Min: {minCashout} NLOV
              </span>
              <span className="text-gray-500">
                Max: {maxCashout} NLOV
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <Card className="p-4 bg-gray-50 dark:bg-gray-800">
            <h4 className="font-medium mb-2">Transaction Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span>{cashoutAmount || '0'} NLOV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Network Fee</span>
                <Badge variant="secondary">Free</Badge>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total</span>
                <span>{cashoutAmount || '0'} NLOV</span>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCashout}
            disabled={!cashoutAmount || processing}
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing
              </>
            ) : (
              <>
                Confirm Cashout
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
