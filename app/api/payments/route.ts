import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get user's JWT from request
const getUserId = async (req: Request): Promise<string | null> => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user?.id || null;
  } catch (error) {
    console.error('Error in getUserId:', error);
    return null;
  }
};

// Create a new payment intent
export async function POST(request: Request) {
  try {
    // Get user ID and validate auth
    let userId = await getUserId(request);
    
    // For development/testing - allow without auth if no user found
    if (!userId) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        userId = 'test-user-' + Date.now(); // Generate test user ID
        console.log('DEV MODE: Using test user ID:', userId);
      } else {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const { planId, amount, currency, cryptoType } = await request.json();
    
    // Validate input
    if (!planId || !amount || !currency || !cryptoType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get wallet address for Solana
    const walletAddress = process.env.SOLANA_WALLET_ADDRESS!;
    
    // Only accept Solana payments
    if (cryptoType !== 'sol') {
      return NextResponse.json(
        { error: 'Only Solana payments are supported' },
        { status: 400 }
      );
    }
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Solana wallet address not configured' },
        { status: 500 }
      );
    }

    // Create payment intent
    const referenceId = `pay_${uuidv4().replace(/-/g, '')}`;
    const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const { data: paymentIntent, error: insertError } = await supabase
      .from('payment_intents')
      .insert([
        {
          reference_id: referenceId,
          user_id: userId,
          plan_id: planId,
          amount: amount,
          currency: currency,
          crypto_type: cryptoType,
          wallet_address: walletAddress,
          expires_at: expiresAt.toISOString()
        }
      ])
      .select()
      .single();

    if (insertError || !paymentIntent) {
      console.error('Error creating payment intent:', insertError);
      throw new Error('Failed to create payment intent');
    }

    return NextResponse.json({
      referenceId: paymentIntent.reference_id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      cryptoType: paymentIntent.crypto_type,
      walletAddress: paymentIntent.wallet_address,
      expiresAt: paymentIntent.expires_at
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get payment intent status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get('referenceId');
    
    if (!referenceId) {
      return NextResponse.json(
        { error: 'Missing referenceId parameter' },
        { status: 400 }
      );
    }

    const { data: rows, error: selectError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('reference_id', referenceId)
      .single();

    if (selectError || !rows) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    const paymentIntent = rows;
    
    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      cryptoType: paymentIntent.crypto_type,
      walletAddress: paymentIntent.wallet_address,
      txHash: paymentIntent.tx_hash,
      confirmedAt: paymentIntent.confirmed_at,
      expiresAt: paymentIntent.expires_at
    });

  } catch (error) {
    console.error('Error getting payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
