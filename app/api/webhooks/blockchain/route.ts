import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Verify webhook signature (implement according to your blockchain's requirements)
const verifyWebhookSignature = (signature: string, payload: any): boolean => {
  // TODO: Implement actual signature verification
  // This is a placeholder - replace with actual verification logic
  return true;
};

// Process Solana transaction
const processSolanaTransaction = async (txData: any) => {
  try {
    // Parse Solana transaction data
    const { signature, amount, destination, referenceId } = txData;
    
    // Find matching payment intent
    const { rows } = await sql`
      SELECT * FROM payment_intents 
      WHERE reference_id = ${referenceId}
      AND status = 'pending'
      AND crypto_type = 'sol'
      AND wallet_address = ${destination}
      AND expires_at > NOW()
      FOR UPDATE SKIP LOCKED
    `;

    if (rows.length === 0) {
      console.log('No matching payment intent found for Solana tx:', { referenceId, destination });
      return false;
    }

    const paymentIntent = rows[0];
    
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
      await sql`
        UPDATE payment_intents 
        SET status = 'failed', 
            tx_hash = ${signature}
        WHERE id = ${paymentIntent.id}
      `;
      
      return false;
    }

    // Update payment intent to confirmed
    await sql`
      UPDATE payment_intents 
      SET status = 'confirmed', 
          tx_hash = ${signature},
          confirmed_at = NOW()
      WHERE id = ${paymentIntent.id}
    `;

    // Update user's subscription
    await updateUserSubscription(paymentIntent.user_id, paymentIntent.plan_id);
    
    return true;
  } catch (error) {
    console.error('Error processing Solana transaction:', error);
    return false;
  }
};

// Update user's subscription
const updateUserSubscription = async (userId: string, planId: string) => {
  try {
    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows
      throw subError;
    }

    const now = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year subscription

    if (subscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          current_period_start: now,
          current_period_end: expiresAt.toISOString(),
          updated_at: now
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: now,
          current_period_end: expiresAt.toISOString(),
          created_at: now,
          updated_at: now
        }]);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-signature');
    const payload = await request.json();

    // Verify webhook signature
    if (!verifyWebhookSignature(signature || '', payload)) {
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
