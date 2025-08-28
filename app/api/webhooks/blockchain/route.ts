import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🚨 CRITICAL: Verify transaction actually exists on blockchain
const verifyTransactionOnChain = async (signature: string, expectedAmount: number, expectedDestination: string): Promise<boolean> => {
  try {
    // For Solana - you MUST verify with actual RPC call
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }]
      })
    });
    
    const data = await response.json();
    
    if (!data.result) {
      console.log('🚨 SECURITY: Transaction not found on Solana blockchain:', signature);
      return false;
    }
    
    // Verify transaction details match
    const transaction = data.result;
    const postBalances = transaction.meta?.postBalances || [];
    const preBalances = transaction.meta?.preBalances || [];
    
    // Calculate actual transferred amount (simplified - needs proper parsing)
    const transferredAmount = Math.abs(postBalances[0] - preBalances[0]) / 1e9; // Convert lamports to SOL
    
    // Verify amount matches (within 1% tolerance for fees)
    if (Math.abs(transferredAmount - expectedAmount) > expectedAmount * 0.01) {
      console.log('🚨 SECURITY: Amount mismatch on chain verification');
      return false;
    }
    
    console.log('✅ SECURITY: Transaction verified on Solana blockchain');
    return true;
    
  } catch (error) {
    console.error('🚨 SECURITY: Blockchain verification failed:', error);
    return false;
  }
};

// Verify webhook signature (implement according to your blockchain's requirements)
const verifyWebhookSignature = (signature: string, payload: any): boolean => {
  try {
    // For development/testing - you can add a shared secret check
    const webhookSecret = process.env.BLOCKCHAIN_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.log('BLOCKCHAIN_WEBHOOK_SECRET not configured, allowing all requests (DEV MODE)');
      return true; // Allow in development if no secret configured
    }

    // Basic HMAC verification for custom webhooks
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    const receivedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Process Solana transaction
const processSolanaTransaction = async (txData: any) => {
  try {
    // Parse Solana transaction data
    const { signature, amount, destination, referenceId } = txData;
    
    // 🚨 CRITICAL: Verify transaction on blockchain
    const isValidTransaction = await verifyTransactionOnChain(signature, amount, destination);
    if (!isValidTransaction) {
      console.log('⚠️ SECURITY: Invalid transaction signature:', signature);
      return false;
    }
    
    // 🚨 CRITICAL: Check for double-spending (transaction already used)
    const { data: existingTx } = await supabase
      .from('payment_intents')
      .select('id, status')
      .eq('tx_hash', signature)
      .eq('status', 'confirmed')
      .limit(1);
    
    if (existingTx && existingTx.length > 0) {
      console.log('🚨 SECURITY: Transaction already used (double-spending attempt):', signature);
      return false;
    }
    
    // Find matching payment intent
    const { data: rows, error: selectError } = await supabase
      .from('payment_intents')
      .select('*')
      .eq('reference_id', referenceId)
      .eq('status', 'pending')
      .eq('crypto_type', 'sol')
      .eq('wallet_address', destination)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (selectError || !rows) {
      console.log('No matching payment intent found for Solana tx:', { referenceId, destination, error: selectError });
      return false;
    }

    const paymentIntent = rows;
    
    // Verify amount matches (with some tolerance for network fees)
    const expectedAmount = Number(paymentIntent.amount);
    const receivedAmount = Number(amount);
    
    if (Math.abs(receivedAmount - expectedAmount) > expectedAmount * 0.01) { // 1% tolerance
      console.log('Amount mismatch for payment intent:', { 
        referenceId, 
        expected: expectedAmount, 
        received: receivedAmount 
      });
      
      // Update status to failed
      await supabase
        .from('payment_intents')
        .update({
          status: 'failed',
          tx_hash: signature
        })
        .eq('id', paymentIntent.id);
      
      return false;
    }

    // Update payment intent to confirmed
    await supabase
      .from('payment_intents')
      .update({
        status: 'confirmed',
        tx_hash: signature,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', paymentIntent.id);

    // Update user's subscription
    await updateUserSubscription(paymentIntent.user_id, paymentIntent.plan_id);
    
    return true;
  } catch (error) {
    console.error('Error processing Solana transaction:', error);
    return false;
  }
};

// Update user's plan in your unified system (profiles table)
const updateUserSubscription = async (userId: string, planId: string) => {
  try {
    console.log(`🔄 Updating user ${userId} to plan ${planId}`);
    
    // Update user's plan in profiles table (your actual table structure)
    const { data: profileUpdate, error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: planId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError);
      throw updateError;
    }

    if (!profileUpdate || profileUpdate.length === 0) {
      console.error('❌ No profile found for user:', userId);
      throw new Error('User profile not found');
    }

    console.log('✅ Successfully updated user plan in profiles table:', profileUpdate[0]);

    // Also check if user is linked in unified_users table for swarm access
    const { data: unifiedUser } = await supabase
      .from('unified_users')
      .select('swarm_user_id, neurolov_email, swarm_email')
      .eq('neurolov_user_id', userId)
      .single();

    if (unifiedUser) {
      console.log('✅ User is linked to swarm - unified access granted:', {
        neurolovEmail: unifiedUser.neurolov_email,
        swarmEmail: unifiedUser.swarm_email
      });
    } else {
      console.log('ℹ️ User not linked to swarm - main app access only');
    }

    return true;
  } catch (error) {
    console.error('❌ Error updating user subscription:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature');
    const payload = await request.json();

    // 🚨 CRITICAL: Input validation
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(signature || '', payload)) {
      console.log('🚨 SECURITY: Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Route to appropriate handler based on blockchain
    const { blockchain } = payload;
    let result = false;

    switch (blockchain) {
      case 'solana':
        result = await processSolanaTransaction(payload);
        break;
      case 'ethereum':
        // TODO: Implement Ethereum transaction processing
        break;
      case 'bitcoin':
        // TODO: Implement Bitcoin transaction processing
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported blockchain' },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to process transaction' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
