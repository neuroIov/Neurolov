import { sql } from '@vercel/postgres';

// Wallet addresses for different blockchains
export const WALLET_ADDRESSES = {
  sol: process.env.SOLANA_WALLET_ADDRESS!,
  eth: process.env.ETHEREUM_WALLET_ADDRESS!,
  btc: process.env.BITCOIN_WALLET_ADDRESS!,
} as const;

// Generate payment reference ID
export function generateReferenceId(prefix = 'pay_'): string {
  return `${prefix}${crypto.randomUUID().replace(/-/g, '')}`;
}

// Format amount for blockchain (smallest unit)
export function formatAmountForBlockchain(amount: number, cryptoType: string): string {
  switch (cryptoType.toLowerCase()) {
    case 'sol':
      return (amount * 1e9).toString(); // SOL to lamports
    case 'eth':
      return (amount * 1e18).toString(); // ETH to wei
    case 'btc':
      return (amount * 1e8).toString(); // BTC to satoshis
    default:
      throw new Error(`Unsupported crypto type: ${cryptoType}`);
  }
}

// Generate payment URI for QR code
export function generatePaymentUri(
  cryptoType: string, 
  address: string, 
  amount?: number,
  referenceId?: string
): string {
  const amountStr = amount !== undefined ? `:${amount}` : '';
  const memo = referenceId ? `?memo=${encodeURIComponent(referenceId)}` : '';
  
  switch (cryptoType.toLowerCase()) {
    case 'sol':
      return `solana:${address}${amountStr}${memo}`;
    case 'eth':
      return `ethereum:${address}${amountStr}${memo}`;
    case 'btc':
      return `bitcoin:${address}${amountStr}${memo}`;
    default:
      throw new Error(`Unsupported crypto type: ${cryptoType}`);
  }
}

// Get QR code URL from external service
export function getQrCodeUrl(uri: string, size = 256): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(uri)}`;
}

// Clean up expired payment intents
export async function cleanupExpiredIntents() {
  try {
    const { rowCount } = await sql`
      UPDATE payment_intents 
      SET status = 'expired'
      WHERE status = 'pending'
      AND expires_at < NOW()
      RETURNING id
    `;
    
    if (rowCount > 0) {
      console.log(`Marked ${rowCount} expired payment intents`);
    }
    
    return rowCount;
  } catch (error) {
    console.error('Error cleaning up expired intents:', error);
    return 0;
  }
}

// Schedule cleanup job
if (process.env.NODE_ENV === 'production') {
  // Run cleanup every hour
  setInterval(cleanupExpiredIntents, 60 * 60 * 1000);
  
  // Initial cleanup
  cleanupExpiredIntents().catch(console.error);
}
