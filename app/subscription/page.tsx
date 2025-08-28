'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { PaymentStatus } from './types';
import './styles.css';
import { useUser } from '../auth/useUser';
import { getSupabaseClient } from '../auth/supabase';
import { ManualCryptoPayment } from './components/ManualCryptoPayment';

// Lazy load the RazorpayPayment component
const RazorpayPayment = dynamic(() => import('./components/RazorpayPayment').then(mod => mod.RazorpayPayment), {
  loading: () => <div className="animate-pulse h-24 bg-gray-100 rounded-lg" />
});

declare global {
  interface Window {
    Razorpay?: any; // Add Razorpay to window object
    selectedPlanAmount?: number; // Add selected plan amount
  }
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const SubscriptionPage = () => {
  const { user, loading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Predefined subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 10,
      currency: 'USD',
      description: 'Perfect for starters',
      features: [
        '6Hr extra on single node in NeuroSwarm',
        'Access to Neuro-image gen,Freedom-AI',
        '10,000 AI credits for AI-Models',
        '24/7 support'
      ]
    },
    {
      id: 'ultimate',
      name: 'Ultimate Plan',
      price: 15,
      currency: 'USD',
      description: 'Most popular choice',
      features: [
        'Access to all basic features',
        'Unlimited credits for Neuro-image gen,Freedom-AI',
        '8Hr extra on each nodes in NeuroSwarm',
        'Deploy upto 2 nodes in NeuroSwarm'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 50,
      currency: 'USD',
      description: 'For power users',
      features: [
        'Access to all Ultimate features',
        'Access to all AI-Models',
        'Unlimited AI-credits',
        '24Hr node runtime on each node',
        'Deploy upto 6 nodes on Neuroswarm'
      ]
    }
  ];

  // Fetch user's current plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) return;
      
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user plan:', error);
        } else if (data && data.plan) {
          setCurrentPlan(data.plan);
        }
      } catch (err) {
        console.error('Failed to fetch user plan:', err);
      }
    };
    
    fetchUserPlan();
  }, [user]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const [exchangeRate, setExchangeRate] = useState<number>(0);

  // Fetch exchange rate when component mounts
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRate(data.rates.INR);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Fallback exchange rate if API fails
        setExchangeRate(83);
      }
    };

    fetchExchangeRate();
  }, []);

  // Update the user's plan in the database
  const updateUserPlan = async (plan: string) => {
    try {
      const response = await fetch('/subscription/api/update-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update plan');
      }

      const data = await response.json();
      setCurrentPlan(data.plan);
      toast.success(`Your subscription plan has been updated to ${data.plan}`);
      return true;
    } catch (err) {
      console.error('Failed to update plan:', err);
      toast.error('Failed to update subscription plan. Please try again.');
      return false;
    }
  };

  const handleRazorpaySuccess = async (amount: number) => {
    // If a plan was selected, update the user's plan
    if (selectedPlan) {
      await updateUserPlan(selectedPlan);
    }
    
    toast.success(`Subscription confirmed! You've successfully subscribed to the plan.`);
    setIsSubscribeModalOpen(false);
    setSelectedPlan(null);
  };

  const handleRazorpayError = (error: string) => {
    setPaymentError(error);
    toast.error(error);
    setSelectedPlan(null);
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setPaymentAmount(plan.price);
    setIsSubscribeModalOpen(true);
    setSelectedPlan(plan.id);
    // Set the selected plan amount in window object for Razorpay component
    if (typeof window !== 'undefined') {
      window.selectedPlanAmount = plan.price;
    }
  };

  const closeSubscribeModal = () => {
    setIsSubscribeModalOpen(false);
    setShowCryptoPayment(false);
    setPaymentAmount(0);
    setPaymentStatus('idle');
    setPaymentError(null);
    setSelectedPlan(null);
  };

  const handleCryptoPaymentSuccess = async (paymentDetails: {
    cryptoType: string;
    amount: number;
    referenceId: string;
    address: string;
    txHash?: string;
  }) => {
    try {
      if (!paymentDetails.txHash) {
        toast.error('Transaction hash is required for verification');
        return false;
      }

      toast.info('Verifying payment on Solana blockchain...', { duration: 3000 });

      // Calculate expected SOL amount from USD
      const solPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        .then(res => res.json())
        .then(data => data.solana?.usd);
      
      const expectedSolAmount = paymentAmount / solPrice;

      // Verify payment with blockchain
      const response = await fetch('/api/verify-crypto-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: paymentDetails.txHash,
          expectedAmount: expectedSolAmount,
          referenceId: paymentDetails.referenceId,
          planId: selectedPlan,
          userId: user?.id,
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Payment verification failed');
      }

      // Payment verified - update user plan
      if (selectedPlan) {
        const planUpdated = await updateUserPlan(selectedPlan);
        if (planUpdated) {
          toast.success('🎉 Payment verified! Your subscription is now active.', {
            duration: 5000,
          });
        }
      }
      
      return true;
    } catch (error: any) {
      console.error('Error processing crypto payment:', error);
      toast.error(error?.message || 'Payment verification failed. Please contact support.');
      return false;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col justify-center items-center gap-8 p-4 min-[calc(100vh - 4rem)]:">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-2">Subscription Plans</h1>
        <p className="text-center text-gray-500 mb-8">
          Your current plan: <span className="font-semibold capitalize">{currentPlan}</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`flex flex-col ${plan.id === currentPlan ? 'border-2 border-green-500 shadow-lg' : plan.recommended ? 'border-2 border-blue-500 shadow-lg' : ''}`}
            >
              <CardHeader>
                {plan.recommended && (
                  <div className="bg-blue-500 text-white text-xs font-semibold py-1 px-3 rounded-full self-start mb-2">
                    Recommended
                  </div>
                )}
                {plan.id === currentPlan && (
                  <div className="bg-green-500 text-white text-xs font-semibold py-1 px-3 rounded-full self-start mb-2">
                    Current Plan
                  </div>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <p className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {exchangeRate ? `(${formatCurrency(Math.ceil(plan.price * exchangeRate), 'INR')})` : '(Loading INR price...)'}
                  </p>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe(plan)} 
                  className={`w-full ${plan.id === currentPlan ? 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={plan.id === currentPlan}
                >
                  {plan.id === currentPlan ? 'Current Plan' : 'Subscribe Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {isSubscribeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {selectedPlan && `Subscribe to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
              </h3>
              <button
                onClick={closeSubscribeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-center text-gray-600 mb-4">
                {selectedPlan && `You selected the ${selectedPlan} plan`}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4 text-sm text-center">
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {formatCurrency(paymentAmount)} ({exchangeRate ? formatCurrency(Math.ceil(paymentAmount * exchangeRate), 'INR') : 'Loading...'})                  
                </p>
                <p className="text-blue-600 dark:text-blue-400">Real-time exchange rate: 1 USD = {exchangeRate ? `₹${exchangeRate.toFixed(2)}` : 'Loading...'}</p>
              </div>
              <div className="border-t border-b py-4 my-4 space-y-4">
                <RazorpayPayment 
                  onSuccess={handleRazorpaySuccess}
                  onError={handleRazorpayError}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                      Or pay with
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowCryptoPayment(true)}
                >
                  Pay with Crypto
                </Button>
              </div>
              {paymentError && (
                <div className="text-red-500 text-center mt-4">{paymentError}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crypto Payment Modal */}
      {isSubscribeModalOpen && showCryptoPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 w-full h-full max-h-[90vh] sm:max-w-2xl lg:max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {selectedPlan && `${subscriptionPlans.find(p => p.id === selectedPlan)?.name || 'Crypto Payment'}`}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Complete your payment securely
                </p>
              </div>
              <button
                onClick={() => setShowCryptoPayment(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
                aria-label="Close payment modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6 pb-8">
                <ManualCryptoPayment 
                  amount={paymentAmount}
                  onPaymentSent={handleCryptoPaymentSuccess}
                  onCancel={() => setShowCryptoPayment(false)}
                  planName={selectedPlan ? subscriptionPlans.find(p => p.id === selectedPlan)?.name : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
