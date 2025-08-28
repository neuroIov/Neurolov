import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createPaymentsTable } from '@/lib/db/schema';
import getSwarmSupabase from '@/app/utils/SwarmSupabase';

// Solana RPC connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Your wallet address (where payments are received) - now from environment
const MERCHANT_WALLET = process.env.SOLANA_WALLET_ADDRESS || '2twCAHzwANMtUc55DhhgT767YdyhBTY98EecBwHJJsxm';

if (!process.env.SOLANA_WALLET_ADDRESS) {
  console.warn('SOLANA_WALLET_ADDRESS not set in environment, using fallback');
}

export async function POST(request: NextRequest) {
  try {
    const { 
      txHash, 
      expectedAmount, 
      referenceId, 
      planId, 
      userId 
    } = await request.json();

    if (!txHash) {
      return NextResponse.json(
        { success: false, error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Get transaction details from Solana blockchain
    const transaction = await connection.getTransaction(txHash, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found or not confirmed yet' },
        { status: 400 }
      );
    }

    // Check if transaction was successful
    if (transaction.meta?.err) {
      return NextResponse.json(
        { success: false, error: 'Transaction failed on blockchain' },
        { status: 400 }
      );
    }

    // Get account keys and instructions (handling versioned transactions)
    let accountKeys: PublicKey[];
    let instructions: any[];
    
    if ('accountKeys' in transaction.transaction.message) {
      // Legacy transaction
      accountKeys = transaction.transaction.message.accountKeys;
      instructions = transaction.transaction.message.instructions;
    } else {
      // Versioned transaction
      accountKeys = transaction.transaction.message.getAccountKeys().keySegments().flat();
      instructions = transaction.transaction.message.compiledInstructions;
    }

    // Find SOL transfer by checking balance changes (more reliable method)
    let transferFound = false;
    let transferAmount = 0;
    let recipientCorrect = false;

    // Get balance changes
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];
    
    // Find our wallet's index and balance change
    const merchantIndex = accountKeys.findIndex((key: PublicKey) => key.toString() === MERCHANT_WALLET);
    
    if (merchantIndex !== -1) {
      const balanceChange = (postBalances[merchantIndex] || 0) - (preBalances[merchantIndex] || 0);
      
      // If balance increased, we received payment
      if (balanceChange > 0) {
        transferAmount = balanceChange / 1000000000; // Convert lamports to SOL
        transferFound = true;
        recipientCorrect = true;
      }
    }

    if (!transferFound) {
      return NextResponse.json(
        { success: false, error: 'No SOL transfer found in transaction' },
        { status: 400 }
      );
    }

    if (!recipientCorrect) {
      return NextResponse.json(
        { success: false, error: 'Payment was not sent to the correct address' },
        { status: 400 }
      );
    }

    // Verify amount (allow small tolerance for price fluctuations)
    const tolerance = expectedAmount * 0.02; // 2% tolerance
    if (Math.abs(transferAmount - expectedAmount) > tolerance) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Amount mismatch. Expected: ${expectedAmount} SOL, Received: ${transferAmount} SOL` 
        },
        { status: 400 }
      );
    }

    // Check transaction age (reject old transactions)
    const transactionTime = transaction.blockTime;
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours

    if (transactionTime && (currentTime - transactionTime) > maxAge) {
      return NextResponse.json(
        { success: false, error: 'Transaction is too old' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if transaction was already used (deduplication)
    const { data: existingPayment } = await supabase
      .from('payment_intents')
      .select('id, status')
      .eq('tx_hash', txHash)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Transaction hash already used' },
        { status: 400 }
      );
    }

    // Store payment record in database
    const paymentData = {
      reference_id: referenceId,
      user_id: user.id,
      plan_id: planId,
      amount: transferAmount,
      currency: 'SOL',
      crypto_type: 'solana',
      status: 'confirmed' as const,
      wallet_address: MERCHANT_WALLET,
      tx_hash: txHash,
      confirmed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };

    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_intents')
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error('Error storing payment record:', paymentError);
      return NextResponse.json(
        { success: false, error: 'Failed to store payment record' },
        { status: 500 }
      );
    }

    // Update user's subscription plan
    const { error: planUpdateError } = await supabase
      .from('profiles')
      .update({ plan: planId.toLowerCase() })
      .eq('id', user.id);

    if (planUpdateError) {
      console.error('Error updating user plan:', planUpdateError);
      // Even if plan update fails, we've recorded the payment
      return NextResponse.json(
        { success: false, error: 'Payment verified but failed to update plan. Contact support.' },
        { status: 500 }
      );
    }

    // Auto-link to swarm account if not already linked
    await autoLinkSwarmAccount(user.id, user.email!, supabase);

    console.log(`Payment verified successfully for user ${user.id}, plan updated to ${planId}`);

    return NextResponse.json({
      success: true,
      message: 'Payment verified and plan updated successfully',
      details: {
        txHash,
        amount: transferAmount,
        timestamp: transactionTime,
        confirmed: true,
        paymentId: paymentRecord.id,
        planId
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    // More detailed error handling
    let errorMessage = 'Failed to verify payment';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Auto-link user to swarm account
async function autoLinkSwarmAccount(userId: string, email: string, supabase: any) {
  try {
    // Check if already linked
    const { data: existingLink } = await supabase
      .from('unified_users')
      .select('id')
      .eq('app_user_id', userId)
      .single();

    if (existingLink) {
      console.log(`User ${userId} already linked to swarm account`);
      return;
    }

    // Get swarm database connection
    const swarmSupabase = getSwarmSupabase();

    // Query swarm user_profiles using RLS-allowed query
    const { data: swarmUser, error: swarmQueryError } = await swarmSupabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (swarmQueryError) {
      if (swarmQueryError.code === 'PGRST116') {
        console.log('No swarm account found for auto-linking with email:', email);
        return;
      } else {
        console.error('Error querying swarm user_profiles:', swarmQueryError);
        return;
      }
    }

    if (swarmUser) {
      // Link accounts in the compute app database
      const { error: linkError } = await supabase
        .from('unified_users')
        .insert({
          app_user_id: userId,
          swarm_user_id: swarmUser.id,
          linked_at: new Date().toISOString(),
          link_method: 'auto_crypto_payment'
        });

      if (linkError) {
        console.error('Auto-link error:', linkError);
      } else {
        console.log(`Successfully auto-linked user ${userId} to swarm account ${swarmUser.id}`);
      }
    } else {
      console.log(`No swarm account found for email ${email}`);
    }
  } catch (error) {
    console.error('Auto-link process failed:', error);
    // Don't throw error as this is optional
  }
}
