'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Loader2, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CryptoAddress {
  symbol: string;
  name: string;
  address: string;
  chain: string; // e.g., 'solana', 'ethereum', 'bitcoin'
  price?: number; // Price in USD
  priceLastUpdated?: number;
}

interface ManualCryptoPaymentProps {
  amount: number;
  onAmountChange: (amount: number) => void;
  onPaymentSent: (paymentDetails: {
    cryptoType: string;
    amount: number;
    referenceId: string;
    address: string;
  }) => Promise<boolean>;
  onCancel: () => void;
}

// Generate a unique reference ID for this payment
const generateReferenceId = () => {
  return `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

export const ManualCryptoPayment = ({
  amount,
  onAmountChange,
  onPaymentSent,
  onCancel,
}: ManualCryptoPaymentProps) => {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('sol');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle');
  const [txHash, setTxHash] = useState(''); // For manual transaction hash input
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number>(0);
  
  // Fetch crypto prices
  const fetchPrices = useCallback(async () => {
    setIsLoadingPrices(true);
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum,bitcoin&vs_currencies=usd',
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      const data = await response.json();
      const now = Date.now();
      
      setCryptoAddresses(prev => ({
        sol: { ...prev.sol, price: data.solana?.usd, priceLastUpdated: now },
        eth: { ...prev.eth, price: data.ethereum?.usd, priceLastUpdated: now },
        btc: { ...prev.btc, price: data.bitcoin?.usd, priceLastUpdated: now },
      }));
      
      setLastPriceUpdate(now);
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error('Failed to fetch latest prices. Using cached values if available.');
    } finally {
      setIsLoadingPrices(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    setReferenceId(generateReferenceId());
    fetchPrices();
    
    // Refresh prices every 2 minutes
    const interval = setInterval(fetchPrices, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrices]);
  
  // Calculate crypto amount based on USD price
  const getCryptoAmount = (usdAmount: number, cryptoKey: string) => {
    const crypto = cryptoAddresses[cryptoKey];
    if (!crypto?.price) return '...';
    const amount = usdAmount / crypto.price;
    return amount < 0.0001 ? amount.toFixed(8) : amount.toFixed(6);
  };

  // Crypto configuration
  const [cryptoAddresses, setCryptoAddresses] = useState<Record<string, CryptoAddress>>({
    sol: {
      symbol: 'SOL',
      name: 'Solana',
      address: 'AZAeMnbfr7UfAvKfeBMj29s73D1pFHPWLZSoDZuwpYa2',
      chain: 'solana',
      price: 0,
      priceLastUpdated: 0
    },
    eth: {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0F31749A1e1d02b01c4b1F913a13544A5B9933CC',
      chain: 'ethereum',
      price: 0,
      priceLastUpdated: 0
    },
    btc: {
      symbol: 'BTC',
      name: 'Bitcoin',
      address: 'bc1pgye98yrll4gfm4qpvmrfa42nu9jtz6w9f9upuujnyepm5gdspcssx0k9at',
      chain: 'bitcoin',
      price: 0,
      priceLastUpdated: 0
    },
  });

  const selected = cryptoAddresses[selectedCrypto];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Generate a payment link with all necessary details
  const generatePaymentLink = (cryptoKey: string) => {
    const crypto = cryptoAddresses[cryptoKey];
    const cryptoAmount = parseFloat(getCryptoAmount(amount, cryptoKey));
    if (isNaN(cryptoAmount)) return crypto.address;
    
    const paymentData = {
      address: crypto.address,
      amount: cryptoAmount,
      usdAmount: amount,
      currency: crypto.symbol,
      reference: referenceId,
      label: 'Compute Subscription',
      message: `Payment for $${amount} subscription (${referenceId})`,
    };

    // Different URI schemes for different blockchains
    switch (crypto.chain) {
      case 'ethereum':
        return `ethereum:${crypto.address}?value=${cryptoAmount * 1e18}&data=${encodeURIComponent(JSON.stringify(paymentData))}`;
      case 'bitcoin':
        return `bitcoin:${crypto.address}?amount=${cryptoAmount}&label=Compute%20Subscription&message=Payment%20${referenceId}`;
      case 'solana':
        return `solana:${crypto.address}?amount=${cryptoAmount}&reference=${referenceId}&label=Compute%20Subscription`;
      default:
        return crypto.address;
    }
  };

  // Generate QR code data URL
  const generateQrCodeUrl = (cryptoKey: string) => {
    const paymentLink = generatePaymentLink(cryptoKey);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`;
  };

  const handlePaymentSent = async () => {
    setIsSubmitting(true);
    setVerificationStatus('pending');
    
    try {
      const crypto = cryptoAddresses[selectedCrypto];
      const success = await onPaymentSent({
        cryptoType: crypto.chain,
        amount,
        referenceId,
        address: crypto.address,
      });
      
      if (success) {
        setVerificationStatus('verified');
        toast.success('Payment submitted for verification');
      } else {
        setVerificationStatus('failed');
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      setVerificationStatus('failed');
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show verification status if pending or completed
  if (verificationStatus === 'pending' || verificationStatus === 'verified' || verificationStatus === 'failed') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          {verificationStatus === 'pending' && (
            <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
          )}
          {verificationStatus === 'verified' && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          {verificationStatus === 'failed' && (
            <AlertCircle className="h-16 w-16 text-red-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {verificationStatus === 'pending' && 'Payment Submitted for Verification'}
            {verificationStatus === 'verified' && 'Payment Verified'}
            {verificationStatus === 'failed' && 'Verification Failed'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {verificationStatus === 'pending' && (
              'Your transaction is being verified. We\'ll notify you once it\'s confirmed.'
            )}
            {verificationStatus === 'verified' && (
              'Thank you! Your payment has been verified and your subscription is now active.'
            )}
            {verificationStatus === 'failed' && (
              'We couldn\'t verify your payment. Please contact support with your transaction details.'
            )}
          </p>
          
          {verificationStatus === 'pending' && (
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">Transaction Hash:</p>
              <code className="text-xs bg-muted p-2 rounded-md block overflow-x-auto">
                {txHash}
              </code>
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              variant={verificationStatus === 'failed' ? 'destructive' : 'default'}
              onClick={verificationStatus === 'failed' ? () => setVerificationStatus('idle') : onCancel}
            >
              {verificationStatus === 'failed' ? 'Try Again' : 'Close'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show payment form if not yet submitted
  const selectedCryptoData = cryptoAddresses[selectedCrypto];
  const qrCodeUrl = generateQrCodeUrl(selectedCrypto);
  const paymentLink = generatePaymentLink(selectedCrypto);

  // Format time since last price update
  const formatTimeAgo = (timestamp: number) => {
    if (!timestamp) return '';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-3 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-medium">Pay with Cryptocurrency</h3>
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          {isLoadingPrices ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <span>Rates updated {formatTimeAgo(lastPriceUpdate)}</span>
          )}
          <button 
            onClick={fetchPrices} 
            className="ml-1.5 text-blue-500 hover:text-blue-700 flex items-center"
            disabled={isLoadingPrices}
            title="Refresh prices"
          >
            <RefreshCw className={cn('h-3 w-3', isLoadingPrices && 'animate-spin')} />
          </button>
        </div>
      </div>
      
      {/* Payment Reference ID */}
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-center text-sm">
        <p className="font-medium">Reference: <code className="font-mono bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{referenceId}</code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(referenceId);
              toast.success('Reference ID copied');
            }}
            className="ml-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 inline-flex items-center"
            title="Copy reference ID"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </p>
      </div>

      {/* Plan Selection */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Select Plan</label>
        <div className="grid grid-cols-3 gap-2">
          {[10, 15, 50].map((planAmount) => (
            <button
              key={planAmount}
              onClick={() => onAmountChange(planAmount)}
              className={`p-2 rounded border text-center ${
                amount === planAmount
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="font-medium text-sm">${planAmount}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {getCryptoAmount(planAmount, selectedCrypto)} {cryptoAddresses[selectedCrypto].symbol}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Crypto Selection */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Select Cryptocurrency</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(cryptoAddresses).map(([key, crypto]) => {
            const isSelected = selectedCrypto === key;
            const isLoading = isLoadingPrices && !crypto.price;
            return (
              <button
                key={key}
                onClick={() => setSelectedCrypto(key)}
                className={`p-2 rounded border transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{crypto.symbol}</span>
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {isLoading ? '...' : 
                   crypto.price ? `$${crypto.price.toLocaleString()}` : '...'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QR Code and Payment Details */}
      <div className="space-y-3">
        <div className="flex flex-col items-center">
          <div className="p-2 bg-white rounded border dark:bg-gray-800 dark:border-gray-700">
            <img
              src={qrCodeUrl}
              alt={`${selectedCryptoData.name} Payment QR Code`}
              className="w-32 h-32"
            />
          </div>
          <a 
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 text-xs text-blue-500 hover:underline flex items-center"
          >
            Open in wallet <ExternalLink className="ml-0.5 h-2.5 w-2.5" />
          </a>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="text-xs text-muted-foreground">Amount (USD)</label>
              <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-medium">
                ${amount.toFixed(2)}
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-xs text-muted-foreground">Amount ({selectedCryptoData.symbol})</label>
              <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm font-medium">
                {isLoadingPrices ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin inline" />
                ) : selectedCryptoData.price ? (
                  getCryptoAmount(amount, selectedCrypto)
                ) : (
                  '...'
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <label className="text-xs text-muted-foreground">Recipient Address</label>
            <div className="flex items-center space-x-1.5">
              <div className="flex-1 p-1.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs overflow-x-auto">
                {selectedCryptoData.address}
              </div>
              <button
                onClick={() => copyToClipboard(selectedCryptoData.address)}
                className="p-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                title="Copy address"
              >
                {copiedAddress === selectedCryptoData.address ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded border border-yellow-100 dark:border-yellow-900/50">
            <p className="font-medium text-xs">Important:</p>
            <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
              <li>Send exactly ${amount} worth of {selectedCryptoData.symbol}</li>
              <li>Include reference ID in memo/note if possible</li>
              <li>Verification may take a few minutes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction Hash Input and Action Buttons */}
      <div className="space-y-2">
        <div className="space-y-1">
          <label htmlFor="txHash" className="text-xs text-muted-foreground">Transaction Hash (Optional)</label>
          <div className="relative">
            <Input
              id="txHash"
              placeholder="Enter transaction hash (optional)"
              value={txHash}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTxHash(e.target.value)}
              className="text-sm h-9"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Helps verify your payment faster
          </p>
        </div>

        <div className="flex space-x-2 pt-1">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-9 text-sm"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handlePaymentSent}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 flex-1 h-9 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Payment Sent'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
