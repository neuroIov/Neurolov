# Crypto Payment Gateway Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Solana Wallet Configuration
SOLANA_WALLET_ADDRESS=2twCAHzwANMtUc55DhhgT767YdyhBTY98EecBwHJJsxm
NEXT_PUBLIC_SOLANA_WALLET_ADDRESS=2twCAHzwANMtUc55DhhgT767YdyhBTY98EecBwHJJsxm

# Optional: Custom Solana RPC (for better performance)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Additional Crypto Wallets (for future use)
BITCOIN_WALLET_ADDRESS=bc1pzq8vvj0cra6ujjw3lhmz8c3pq5am8k446chch7sn9vfuy9wj7w7s24ea7s
ETHEREUM_WALLET_ADDRESS=0x762E2aFB0C3adC633A524B4ED0cA6c4fEfdEB8d2

# Swarm Database Connection (ensure these are set)
NEXT_PUBLIC_SWARM_SUPABASE_URL=your_swarm_supabase_url
NEXT_PUBLIC_SWARM_SUPABASE_ANON_KEY=your_swarm_supabase_key

# IMPORTANT: Add service role key to bypass RLS policies for account linking
SWARM_SUPABASE_SERVICE_ROLE_KEY=your_swarm_service_role_key
```

## Database Setup

Ensure your Supabase database has the following tables:

### 1. `payment_intents` table
```sql
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
  tx_hash VARCHAR(100) UNIQUE,
  confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_reference_id ON payment_intents(reference_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_tx_hash ON payment_intents(tx_hash);
```

### 2. `unified_users` table (if not exists)
```sql
CREATE TABLE IF NOT EXISTS unified_users (
  id SERIAL PRIMARY KEY,
  app_user_id VARCHAR(100) NOT NULL,
  swarm_user_id VARCHAR(100) NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  link_method VARCHAR(50) DEFAULT 'manual',
  UNIQUE(app_user_id, swarm_user_id)
);
```

## Features Implemented

### ✅ Payment Verification
- Blockchain transaction verification
- Amount validation with 2% tolerance
- Transaction age validation (24h max)
- Duplicate transaction prevention

### ✅ Payment Storage
- All payments stored in `payment_intents` table
- Complete audit trail
- Status tracking (pending/confirmed/failed)

### ✅ User Integration
- Automatic swarm account linking
- Plan upgrade automation
- Real-time UI updates

### ✅ Security Features
- Transaction hash deduplication
- User authentication required
- Environment variable configuration
- Detailed error logging

## Payment Flow

1. User selects subscription plan
2. System generates unique reference ID
3. User sends SOL to merchant wallet
4. User submits transaction hash
5. System verifies on Solana blockchain
6. Payment record stored in database
7. User plan upgraded automatically
8. Auto-link to swarm account (if applicable)
9. Success confirmation

## Error Handling

The system now provides detailed error messages for:
- Invalid transaction hashes
- Already used transactions
- Insufficient payment amounts
- Authentication failures
- Database errors
- Network issues

## Testing

To test the payment system:
1. Ensure environment variables are set
2. Run database migrations
3. Navigate to `/subscription`
4. Select a plan and choose crypto payment
5. Send test SOL to the wallet address
6. Submit the transaction hash
7. Verify plan upgrade and payment record

## Monitoring

Check the server logs for detailed payment processing information:
- Payment verification attempts
- Blockchain queries
- Database operations
- Auto-linking results
