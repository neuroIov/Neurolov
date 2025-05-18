import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { amount } = await request.json();

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount. Please provide a valid positive number.' },
                { status: 400 }
            );
        }

        // Check if Razorpay keys are available
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys are not configured in environment variables');
            return NextResponse.json(
                { error: 'Payment service is not properly configured' },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // Razorpay uses paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1, // Auto-capture payment
        };

        try {
            const order = await razorpay.orders.create(options);

            return NextResponse.json({
                orderId: order.id,
                key: process.env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
            });
        } catch (error) {
            console.error('Razorpay Order Creation Error:', error);
            return NextResponse.json(
                { error: 'Failed to create order with Razorpay' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Route Error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
