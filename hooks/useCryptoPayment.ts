import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '../app/auth/useUser';

interface PaymentIntent {
  referenceId: string;
  amount: number;
  currency: string;
  cryptoType: string;
  walletAddress: string;
  expiresAt: string;
}

interface PaymentStatus {
  status: 'idle' | 'pending' | 'confirmed' | 'failed' | 'expired';
  error?: string;
  paymentIntent?: PaymentIntent;
  txHash?: string;
}

export function useCryptoPayment() {
  const [status, setStatus] = useState<PaymentStatus>({ status: 'idle' });
  const { user } = useUser();

  const createPaymentIntent = async (planId: string, amount: number, currency: string, cryptoType: string) => {
    try {
      setStatus({ status: 'pending' });
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          planId,
          amount,
          currency,
          cryptoType
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const paymentIntent = await response.json();
      setStatus({ 
        status: 'pending', 
        paymentIntent 
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setStatus({ 
        status: 'failed', 
        error: error.message || 'Failed to create payment intent' 
      });
      toast.error(error.message || 'Failed to create payment intent');
      throw error;
    }
  };

  const checkPaymentStatus = async (referenceId: string) => {
    try {
      const response = await fetch(`/api/payments?referenceId=${referenceId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      
      if (data.status === 'confirmed') {
        setStatus({ 
          status: 'confirmed',
          paymentIntent: status.paymentIntent,
          txHash: data.txHash
        });
        toast.success('Payment confirmed! Your subscription has been activated.');
      } else if (data.status === 'failed' || data.status === 'expired') {
        setStatus({ 
          status: data.status,
          error: `Payment ${data.status}`,
          paymentIntent: status.paymentIntent
        });
        toast.error(`Payment ${data.status}. Please try again.`);
      }

      return data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  };

  const pollPaymentStatus = async (referenceId: string, interval = 5000, maxAttempts = 36) => {
    let attempts = 0;
    
    const check = async (): Promise<boolean> => {
      attempts++;
      
      try {
        const data = await checkPaymentStatus(referenceId);
        
        if (data.status === 'confirmed') {
          return true;
        }
        
        if (attempts >= maxAttempts) {
          setStatus(prev => ({
            ...prev,
            error: 'Payment verification timeout',
            status: 'failed'
          }));
          toast.error('Payment verification timeout. Please contact support.');
          return false;
        }
        
        // Continue polling
        return new Promise(resolve => {
          setTimeout(() => check().then(resolve), interval);
        });
      } catch (error) {
        console.error('Error in payment polling:', error);
        return false;
      }
    };
    
    return check();
  };

  const reset = () => {
    setStatus({ status: 'idle' });
  };

  return {
    status,
    createPaymentIntent,
    checkPaymentStatus,
    pollPaymentStatus,
    reset
  };
}
