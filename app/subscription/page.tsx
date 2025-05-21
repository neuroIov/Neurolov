'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from 'react-hot-toast';
import { PaymentStatus } from './types';
import './styles.css';
import { useUser } from '../auth/useUser';
import { getSupabaseClient } from '../auth/supabase';

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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
    setPaymentAmount(0);
    setPaymentStatus('idle');
    setPaymentError(null);
    setSelectedPlan(null);
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
              className={`flex flex-col h-full ${plan.id === currentPlan ? 'border-2 border-green-500 shadow-lg' : plan.recommended ? 'border-2 border-blue-500 shadow-lg' : ''}`}
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
              <CardContent className="flex flex-col flex-grow">
                <div className="mb-6">
                  <p className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</p>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
                <ul className="space-y-2 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto pt-4">
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
                {selectedPlan && `You selected the ${selectedPlan} plan for ${formatCurrency(paymentAmount)}`}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4 text-sm text-center">
                <p className="font-medium text-blue-700 dark:text-blue-300">Test Mode Active</p>
                <p className="text-blue-600 dark:text-blue-400">You will only be charged ₹1 for this transaction</p>
              </div>
              <div className="border-t border-b py-4 my-4">
                <RazorpayPayment 
                  onSuccess={handleRazorpaySuccess}
                  onError={handleRazorpayError}
                />
              </div>
              {paymentError && (
                <div className="text-red-500 text-center mt-4">{paymentError}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
