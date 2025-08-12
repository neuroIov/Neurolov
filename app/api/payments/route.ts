import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
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
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planId, amount, currency, cryptoType } = await request.json();
    
    // Validate input
    if (!planId || !amount || !currency || !cryptoType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get wallet address for the selected crypto
    const walletAddresses = {
      sol: process.env.SOLANA_WALLET_ADDRESS!,
      eth: process.env.ETHEREUM_WALLET_ADDRESS!,
      btc: process.env.BITCOIN_WALLET_ADDRESS!,
    };

    const walletAddress = walletAddresses[cryptoType as keyof typeof walletAddresses];
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Invalid cryptocurrency type' },
        { status: 400 }
      );
    }

    // Create payment intent
    const referenceId = `pay_${uuidv4().replace(/-/g, '')}`;
    const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const { rows } = await sql`
      INSERT INTO payment_intents (
        reference_id, 
        user_id, 
        plan_id, 
        amount, 
        currency, 
        crypto_type, 
        wallet_address, 
        expires_at
      )
      VALUES (
        ${referenceId},
        ${userId},
        ${planId},
        ${amount},
        ${currency},
        ${cryptoType},
        ${walletAddress},
        ${expiresAt.toISOString()}
      )
      RETURNING *
    `;

    const paymentIntent = rows[0];

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

    const { rows } = await sql`
      SELECT * FROM payment_intents 
      WHERE reference_id = ${referenceId}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    const paymentIntent = rows[0];
    
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
