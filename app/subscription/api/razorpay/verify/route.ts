import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = await request.json();

        // Verify that all required parameters are present
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { verified: false, error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Get the secret key from environment variables
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error('Razorpay secret key not found in environment variables');
            return NextResponse.json(
                { verified: false, error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Create the signature verification data
        const payload = razorpay_order_id + '|' + razorpay_payment_id;

        // Create an HMAC-SHA256 signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        // Verify the signature
        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            // Signature is valid, payment is authentic
            // Here you would update your database to mark the payment as verified

            return NextResponse.json({
                verified: true,
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id
            });
        } else {
            // Signature verification failed
            console.warn('Razorpay signature verification failed');
            return NextResponse.json(
                { verified: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        return NextResponse.json(
            { verified: false, error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
} 