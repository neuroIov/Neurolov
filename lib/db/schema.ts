import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function createPaymentsTable() {
  try {
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS payment_intents (
        id SERIAL PRIMARY KEY,
        reference_id VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        amount DECIMAL(18, 8) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        crypto_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        wallet_address VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        tx_hash VARCHAR(100),
        confirmed_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_payment_intents_reference_id ON payment_intents(reference_id);
      CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
    `;
    return createTable;
  } catch (error) {
    console.error('Error creating payment_intents table:', error);
    throw error;
  }
}

// Initialize database if not already done
createPaymentsTable().catch(console.error);

export interface PaymentIntent {
  id: number;
  reference_id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  crypto_type: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  wallet_address: string;
  created_at: Date;
  expires_at: Date;
  tx_hash?: string;
  confirmed_at?: Date;
}
