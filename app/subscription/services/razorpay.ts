import { RazorpayDetails, PaymentResponse } from '../types';

export class RazorpayService {
    static loadRazorpayScript(): Promise<boolean> {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    static createRazorpayInstance(key: string) {
        if (!window.Razorpay) {
            throw new Error('Razorpay script not loaded');
        }
        return new window.Razorpay({ key });
    }

    static async verifyPayment(paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{ verified: boolean; error?: string }> {
        try {
            const response = await fetch('/subscription/api/razorpay/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            const data = await response.json();
            return { verified: data.verified, error: data.error };
        } catch (error) {
            console.error('Verification error:', error);
            return { verified: false, error: 'Failed to verify payment' };
        }
    }

    static handlePayment(details: RazorpayDetails, key: string): Promise<PaymentResponse> {
        return new Promise(async (resolve, reject) => {
            const scriptLoaded = await this.loadRazorpayScript();

            if (!scriptLoaded) {
                reject({
                    success: false,
                    transactionId: null,
                    message: 'Failed to load Razorpay script',
                });
                return;
            }

            try {
                const razorpay = this.createRazorpayInstance(key);

                const options = {
                    key,
                    amount: details.amount * 100, // Razorpay expects amount in paise (smallest currency unit)
                    currency: details.currency || 'INR', // Default to INR
                    name: details.name || 'Neurolov',
                    description: details.description || `Test payment of ₹${details.amount}`,
                    order_id: details.orderId,
                    prefill: details.prefill || {},
                    notes: details.notes || {
                        order_type: 'subscription',
                        testMode: 'true'
                    },
                    handler: async function (response: any) {
                        // Verify the payment
                        const verificationResult = await RazorpayService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verificationResult.verified) {
                            // Get display amount from notes if present
                            const displayAmount = details.notes?.displayAmount
                                ? parseFloat(details.notes.displayAmount)
                                : details.amount;

                            // Use display currency if specified, or USD for display amounts, INR otherwise
                            const displayCurrency = details.notes?.displayCurrency ||
                                (details.notes?.displayAmount ? 'USD' : details.currency || 'INR');

                            resolve({
                                success: true,
                                transactionId: response.razorpay_payment_id,
                                message: 'Payment successful',
                                status: 'completed',
                                timestamp: new Date().toISOString(),
                                paymentDetails: {
                                    amount: parseFloat(displayAmount.toString()),
                                    currency: displayCurrency,
                                    method: 'razorpay',
                                },
                            });
                        } else {
                            reject({
                                success: false,
                                transactionId: response.razorpay_payment_id,
                                message: verificationResult.error || 'Payment verification failed',
                                status: 'failed',
                                timestamp: new Date().toISOString(),
                            });
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            reject({
                                success: false,
                                transactionId: null,
                                message: 'Payment cancelled by user',
                                status: 'failed',
                                timestamp: new Date().toISOString(),
                            });
                        },
                    },
                    theme: {
                        color: '#3B82F6', // Blue color
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } catch (error) {
                console.error('Razorpay error:', error);
                reject({
                    success: false,
                    transactionId: null,
                    message: error instanceof Error ? error.message : 'Payment processing failed',
                    status: 'failed',
                    timestamp: new Date().toISOString(),
                });
            }
        });
    }
} 