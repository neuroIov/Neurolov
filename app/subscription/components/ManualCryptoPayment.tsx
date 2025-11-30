'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Loader2, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

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
  onPaymentSent: (paymentDetails: {
    cryptoType: string;
    amount: number;
    referenceId: string;
    address: string;
    txHash?: string;
  }) => Promise<boolean>;
  onCancel: () => void;
  planName?: string;
}

// Generate a proper Solana Pay reference using crypto-secure random bytes
const generateReferenceId = () => {
  try {
    // Generate a new keypair and use its public key as reference
    // This ensures we get a proper 32-byte array that's valid for Solana
    const keypair = Keypair.generate();
    const referenceBytes = keypair.publicKey.toBytes();
    
    // Convert to base58 using the proper bs58 library
    return bs58.encode(referenceBytes);
  } catch (error) {
    console.error('Error generating reference ID:', error);
    // Fallback: generate random 32 bytes and encode properly
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bs58.encode(bytes);
  }
};

export const ManualCryptoPayment = ({
  amount,
  onPaymentSent,
  onCancel,
  planName,
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
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,swarm&vs_currencies=usd',
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
        swarm: { ...prev.swarm, price: data.swarm?.usd, priceLastUpdated: now },
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
    if (!crypto?.price || crypto.price === 0) {
      // Return null if price not available - don't generate QR yet
      return null;
    }
    const amount = usdAmount / crypto.price;
    return amount < 0.0001 ? amount.toFixed(8) : amount.toFixed(6);
  };

  // Get numeric crypto amount for calculations
  const getCryptoAmountNumeric = (usdAmount: number, cryptoKey: string): number | null => {
    const crypto = cryptoAddresses[cryptoKey];
    if (!crypto?.price || crypto.price === 0) return null;
    return usdAmount / crypto.price;
  };

  // Crypto configuration - using environment variable
  const [cryptoAddresses, setCryptoAddresses] = useState<Record<string, CryptoAddress>>({
    sol: {
      symbol: 'SOL',
      name: 'Solana',
      address: process.env.NEXT_PUBLIC_SOLANA_WALLET_ADDRESS || '2twCAHzwANMtUc55DhhgT767YdyhBTY98EecBwHJJsxm',
      chain: 'solana',
      price: 0,
      priceLastUpdated: 0
    },
    swarm: {
      symbol: 'SWARM',
      name: 'Swarm',
      address: 'otgodXJDJFFip57AA43ERfDs8pcGviDd9oUJsnEcyai',
      chain: 'solana',
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
    try {
      const crypto = cryptoAddresses[cryptoKey];
      const cryptoAmount = getCryptoAmountNumeric(amount, cryptoKey);
      
      // Don't generate link if price not available
      if (!cryptoAmount || !referenceId) {
        console.warn('Cannot generate payment link: missing crypto amount or reference ID');
        return null;
      }
      
      // Validate that we have a proper reference ID (should be base58 encoded 32 bytes)
      if (referenceId.length < 32) {
        console.error('Invalid reference ID length:', referenceId.length);
        return null;
      }
      
      if (cryptoKey === 'sol') {
        // Use official Solana Pay specification format for SOL
        const params = new URLSearchParams();
        params.append('amount', cryptoAmount.toFixed(6));
        params.append('reference', referenceId);
        params.append('label', 'Compute Subscription');
        params.append('message', `Payment for $${amount} subscription`);
        
        const paymentUrl = `solana:${crypto.address}?${params.toString()}`;
        console.log('Generated Solana Pay URL:', paymentUrl);
        
        return paymentUrl;
      } else if (cryptoKey === 'swarm') {
        // For SWARM token, create a basic payment URI since Solana Pay doesn't support SPL tokens yet
        // Format: solana:<address>?amount=<amount>&spl-token=<token>&reference=<ref>&label=<label>&message=<message>
        const params = new URLSearchParams();
        params.append('amount', cryptoAmount.toFixed(6));
        params.append('spl-token', crypto.address); // SWARM token mint address
        params.append('reference', referenceId);
        params.append('label', 'Compute Subscription');
        params.append('message', `Payment for $${amount} subscription in SWARM tokens`);
        
        const paymentUrl = `solana:${process.env.NEXT_PUBLIC_SOLANA_WALLET_ADDRESS || '2twCAHzwANMtUc55DhhgT767YdyhBTY98EecBwHJJsxm'}?${params.toString()}`;
        console.log('Generated SWARM Payment URL:', paymentUrl);
        
        return paymentUrl;
      } else {
        console.error('Unsupported crypto type:', cryptoKey);
        return null;
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast.error('Failed to generate payment link. Please refresh and try again.');
      return null;
    }
  };

  // Generate QR code data URL
  const generateQrCodeUrl = (cryptoKey: string) => {
    const paymentLink = generatePaymentLink(cryptoKey);
    
    // Don't generate QR if payment link not available
    if (!paymentLink) {
      return null;
    }
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`;
  };

  const handlePaymentSent = async () => {
    if (!txHash.trim()) {
      toast.error('Please enter the transaction hash to verify your payment');
      return;
    }

    setIsSubmitting(true);
    setVerificationStatus('pending');
    
    try {
      const crypto = cryptoAddresses[selectedCrypto];
      const success = await onPaymentSent({
        cryptoType: crypto.chain,
        amount,
        referenceId,
        address: crypto.address,
        txHash: txHash.trim(),
      });
      
      if (success) {
        setVerificationStatus('verified');
        toast.success('Payment verified successfully! 🎉');
      } else {
        setVerificationStatus('failed');
        toast.error('Payment verification failed. Please check your transaction hash.');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      setVerificationStatus('failed');
      toast.error('An error occurred during verification. Please try again.');
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
    <div className="space-y-4 w-full max-w-none">
      {/* Amount Display */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6 text-center">
        <div className="space-y-2">
          <p className="text-sm opacity-90">Amount to Pay</p>
          <div className="text-3xl sm:text-4xl font-bold">
            ${amount.toFixed(2)}
          </div>
          <div className="pt-2 border-t border-blue-400/30">
            <div className="flex items-center justify-center space-x-2 text-sm sm:text-base">
              <span className="opacity-90">≈</span>
              {isLoadingPrices ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="font-mono font-semibold">
                  {getCryptoAmount(amount, selectedCrypto) || '...'} {selectedCryptoData.symbol}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price Update Status */}
      <div className="text-center">
        <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
          {isLoadingPrices ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating prices...</span>
            </div>
          ) : (
            <span>Rates updated {formatTimeAgo(lastPriceUpdate)}</span>
          )}
          <button 
            onClick={fetchPrices} 
            className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all touch-manipulation"
            disabled={isLoadingPrices}
            title="Refresh prices"
          >
            <RefreshCw className={cn('h-4 w-4', isLoadingPrices && 'animate-spin')} />
          </button>
        </div>
      </div>
      
      {/* Payment Reference ID */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-xl text-center">
        <p className="font-medium text-sm mb-2">Payment Reference</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <code className="font-mono bg-blue-200/50 dark:bg-blue-900/50 px-3 py-2 rounded-lg text-sm font-semibold">
            {referenceId}
          </code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(referenceId);
              toast.success('Reference ID copied');
            }}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 rounded-lg hover:bg-blue-200/50 dark:hover:bg-blue-900/50 transition-all touch-manipulation"
            title="Copy reference ID"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cryptocurrency Selection */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
        <h3 className="text-base font-semibold mb-3">Choose Payment Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Solana (SOL) */}
          <div 
            className={cn(
              "p-3 bg-white dark:bg-gray-800 rounded-lg border-2 cursor-pointer transition-all",
              selectedCrypto === 'sol' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
            onClick={() => setSelectedCrypto('sol')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">Solana (SOL)</p>
                <p className="text-sm text-muted-foreground">
                  {isLoadingPrices ? (
                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                  ) : cryptoAddresses.sol.price ? (
                    `$${cryptoAddresses.sol.price.toLocaleString()}`
                  ) : (
                    'Price loading...'
                  )}
                </p>
              </div>
              {selectedCrypto === 'sol' && <Check className="h-5 w-5 text-blue-500" />}
            </div>
          </div>

          {/* Swarm (SWARM) */}
          <div 
            className={cn(
              "p-3 bg-white dark:bg-gray-800 rounded-lg border-2 cursor-pointer transition-all",
              selectedCrypto === 'swarm' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
            onClick={() => setSelectedCrypto('swarm')}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                SW
              </div>
              <div className="flex-1">
                <p className="font-semibold text-base">Swarm (SWARM)</p>
                <p className="text-sm text-muted-foreground">
                  {isLoadingPrices ? (
                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                  ) : cryptoAddresses.swarm.price ? (
                    `$${cryptoAddresses.swarm.price.toLocaleString()}`
                  ) : (
                    'Price loading...'
                  )}
                </p>
              </div>
              {selectedCrypto === 'swarm' && <Check className="h-5 w-5 text-blue-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code and Payment Details */}
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          {qrCodeUrl ? (
            <>
              <div className="p-4 bg-white rounded-xl border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-lg">
                <img
                  src={qrCodeUrl}
                  alt={`${selectedCryptoData.name} Payment QR Code`}
                  className="w-40 h-40 sm:w-48 sm:h-48"
                />
              </div>
              {paymentLink && (
                <a 
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all touch-manipulation"
                >
                  <span>Open in Phantom</span>
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </>
          ) : (
            <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading payment QR code...</p>
                <p className="text-xs text-gray-500 mt-1">Fetching current SOL price</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount (USD)</label>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border font-semibold text-center text-xl">
                ${amount.toFixed(2)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Amount ({selectedCryptoData.symbol})</label>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border font-mono font-semibold text-center text-xl">
                {isLoadingPrices ? (
                  <Loader2 className="h-6 w-6 animate-spin inline" />
                ) : (
                  getCryptoAmount(amount, selectedCrypto) || '...'
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Recipient Address</label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-xl border font-mono text-sm break-all">
                {selectedCryptoData.address}
              </div>
              <button
                onClick={() => copyToClipboard(selectedCryptoData.address)}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all touch-manipulation"
                title="Copy address"
              >
                {copiedAddress === selectedCryptoData.address ? (
                  <Check className="h-6 w-6 text-green-500" />
                ) : (
                  <Copy className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-4 sm:p-5 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Important Instructions:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Send exactly ${amount} worth of {selectedCryptoData.symbol}</li>
                  <li>Include reference ID in memo/note if possible</li>
                  <li>Verification may take a few minutes</li>
                  <li>Do not send from an exchange wallet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Hash Input and Action Buttons */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="txHash" className="text-sm font-medium text-muted-foreground">
            Transaction Hash <span className="text-red-500">*Required</span>
          </label>
          <div className="relative">
            <Input
              id="txHash"
              placeholder="Paste your transaction hash here (e.g., 5Kj...abc)"
              value={txHash}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTxHash(e.target.value)}
              className="h-10 text-sm border-2 focus:border-blue-500 rounded-lg font-mono"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>After sending payment:</strong> Copy the transaction hash from your wallet and paste it here for instant verification
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 h-11 text-sm font-medium border-2 rounded-lg touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handlePaymentSent}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 flex-1 h-11 text-sm font-medium rounded-lg touch-manipulation shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'I\'ve Sent the Payment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
