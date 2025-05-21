'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import { PaymentStatus } from '@/app/subscription/types';
import { RazorpayService } from '@/app/subscription/services/razorpay';
import { useUser } from '@/app/auth/useUser';

interface RazorpayPaymentProps {
  onSuccess: (amount: number) => void;
  onError: (error: string) => void;
}

export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ onSuccess, onError }): ReactNode => {
  const { user, loading } = useUser();
  const [status, setStatus] = useState<PaymentStatus>('idle');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handlePayment = async () => {
    setStatus('processing');
    try {
      // Display amount from window object (in dollars)
      const displayAmount = window.selectedPlanAmount || 10;
      
      // Actual amount to process (1 rupee)
      const processAmount = 1;
      
      // First create an order on the server
      const response = await fetch('/subscription/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: processAmount, // Process only 1 rupee
          displayAmount: displayAmount // Send display amount for reference
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const orderData = await response.json();

      // Now use Razorpay service to handle the payment
      const result = await RazorpayService.handlePayment(
        {
          orderId: orderData.orderId,
          amount: processAmount, // Process only 1 rupee
          currency: 'INR', // Use INR for the actual processing
          name: 'Neurolov Subscription',
          description: `Payment of ${formatCurrency(displayAmount)} (Test Mode: ₹1)`,
          prefill: {
            name: user?.user_metadata?.full_name || '',
            email: user?.user_metadata?.email || '',
          },
          notes: {
            displayAmount: displayAmount.toString(),
            testMode: 'true'
          }
        },
        orderData.key
      );

      if (result.success) {
        setStatus('success');
        // Return the display amount (what user selected) to update UI
        onSuccess(displayAmount);
        // We don't show a toast here since the parent component will handle it
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setStatus('idle');
    }
  };

  // Get the display amount
  const displayAmount = window.selectedPlanAmount || 10;

  return (
    loading ? <div className="animate-pulse h-24 bg-gray-100 rounded-lg" /> : 
    <div className="space-y-4">
      
      <Button
        onClick={handlePayment}
        disabled={status === 'processing'}
        className={`w-full ${status === 'processing' ? 'opacity-75 cursor-not-allowed' : ''} 
bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2`}
      >
        {status === 'processing' ? 'Processing...' : 'Pay with Razorpay'}
      </Button>
    </div>
  );
}; 