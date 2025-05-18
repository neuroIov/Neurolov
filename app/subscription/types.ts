// Extend Window interface without conflicting with existing declarations
interface CustomWindow {
  Razorpay?: any; // Add Razorpay to window interface
  selectedPlanAmount?: number; // Add selected plan amount to window
}

declare global {
  interface Window extends CustomWindow { }
}

export type PaymentType = 'razorpay';

export interface PaymentDetails {
  amount: number;
  currency: string;
  description?: string;
}

export interface RazorpayDetails extends PaymentDetails {
  orderId: string;
  name: string;
  email?: string;
  contact?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  notes?: {
    order_type?: string;
    testMode?: string;
    displayAmount?: string;
    displayCurrency?: string;
    [key: string]: string | undefined;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string | null;
  message: string;
  status?: 'pending' | 'completed' | 'failed';
  timestamp?: string;
  paymentDetails?: {
    amount: number;
    currency: string;
    method: PaymentType;
  };
}

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  recommended?: boolean;
}
