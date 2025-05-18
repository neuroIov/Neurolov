import { PaymentDetails, PaymentResponse, RazorpayDetails } from '../types';
import { DEV_CONFIG } from '../config/dev';

interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  method: 'razorpay';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  details: {
    paymentId: string;
    currency: string;
    description?: string;
  };
}

class PaymentService {
  private transactions: WalletTransaction[] = [];

  private generateTransactionId = () => {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  private simulatePaymentProcess = async (
    amount: number
  ): Promise<PaymentResponse> => {
    // Simulate network delay
    await new Promise(resolve =>
      setTimeout(resolve, DEV_CONFIG.PROCESSING_DELAYS.RAZORPAY)
    );

    // Simulate success/failure based on configured rates
    const isSuccessful = Math.random() < DEV_CONFIG.SUCCESS_RATES.RAZORPAY;

    // Simulate random failures
    if (!isSuccessful) {
      const errors = [
        DEV_CONFIG.ERROR_MESSAGES.NETWORK,
        DEV_CONFIG.ERROR_MESSAGES.TIMEOUT,
        DEV_CONFIG.ERROR_MESSAGES.INSUFFICIENT_BALANCE,
      ];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }

    const transactionId = this.generateTransactionId();

    // Record successful transaction
    this.recordTransaction({
      id: transactionId,
      amount,
      type: 'credit',
      method: 'razorpay',
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: {
        paymentId: transactionId,
        currency: 'USD',
      },
    });

    return {
      success: true,
      transactionId,
      message: 'Payment processed successfully',
      status: 'completed',
      timestamp: new Date().toISOString(),
      paymentDetails: {
        amount,
        currency: 'USD',
        method: 'razorpay',
      },
    };
  };

  private recordTransaction(transaction: WalletTransaction) {
    this.transactions.push(transaction);
    // In development, log to console
    console.log('Transaction recorded:', transaction);
  }

  async processRazorpayPayment(details: RazorpayDetails): Promise<PaymentResponse> {
    try {
      // For Razorpay, we first need to create an order server-side
      const response = await fetch('/wallet/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: details.amount
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Razorpay order');
      }

      const orderData = await response.json();

      // The actual payment processing is handled client-side by the RazorpayPayment component
      // This method just returns the order data to be used by that component
      return {
        success: true,
        transactionId: orderData.orderId,
        message: 'Razorpay order created successfully',
        status: 'pending',
        timestamp: new Date().toISOString(),
        paymentDetails: {
          amount: details.amount,
          currency: orderData.currency || 'USD',
          method: 'razorpay',
        },
      };
    } catch (error) {
      console.error('Razorpay payment error:', error);
      throw error;
    }
  }

  async getTransactionHistory(): Promise<WalletTransaction[]> {
    return this.transactions;
  }
}

export const paymentService = new PaymentService();
