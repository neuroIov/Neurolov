# Crypto Payment Integration Setup

## Database Setup

1. Run the following SQL to create the required tables:

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
  tx_hash VARCHAR(100),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_reference_id ON payment_intents(reference_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
```

## Blockchain Setup

### Solana

1. Set up a Solana RPC endpoint (e.g., QuickNode, Alchemy, or your own node)
2. Configure the webhook to listen for transactions to your wallet

### Ethereum

1. Set up an Ethereum RPC endpoint
2. Configure the webhook to listen for transactions to your wallet

### Bitcoin

1. Set up a Bitcoin node or use a service like BlockCypher
2. Configure the webhook to listen for transactions to your wallet

## Webhook Configuration

1. Deploy the application
2. Set up webhook URLs for each blockchain to point to:
   - `https://yourdomain.com/api/webhooks/blockchain`
3. Configure the webhook to send transaction data in the following format:

```json
{
  "blockchain": "solana" | "ethereum" | "bitcoin",
  "signature": "transaction_signature",
  "amount": "amount_in_smallest_unit",
  "destination": "destination_wallet_address",
  "referenceId": "payment_reference_id"
}
```

## Testing

1. Use testnet wallets for development
2. Test with small amounts first
3. Verify transaction processing and status updates

## Monitoring

1. Set up logging for payment processing
2. Monitor for failed transactions
3. Set up alerts for critical failures

## Security

1. Keep private keys secure
2. Use environment variables for sensitive data
3. Implement rate limiting on API endpoints
4. Verify webhook signatures

## Troubleshooting

1. Check server logs for errors
2. Verify database connections
3. Confirm webhook configurations
4. Test with known good transactions
