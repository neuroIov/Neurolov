'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/app/auth/useUser';
import { signInWithProvider, signInWithEmail, signUpWithEmail, getSupabaseClient } from '@/app/auth/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { feature_flags } from '@/utils/featureFlags';


export default function RootPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [isLoadingReferral, setIsLoadingReferral] = useState(false);
  const loginAttemptRef = useRef(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const urlReferralCode = searchParams.get('referral');
    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
      localStorage.setItem('referralCode', urlReferralCode);
    } else {
      const storedReferralCode = localStorage.getItem('referralCode');
      if (storedReferralCode) {
        setReferralCode(storedReferralCode);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
    };
  }, [user, loading, router]);

  const applyReferralCode = async () => {
    if (!inputReferralCode.trim()) return;

    try {
      setIsLoadingReferral(true);
      const client = getSupabaseClient();

      const { data, error } = await client.rpc('is_referral_code_exists', {
        check_referral_code: inputReferralCode.trim()
      });

      if (error) {
        console.error('Error checking referral code:', error);
        toast.error('Error validating referral code');
        return;
      }

      if (!data || data === false) {
        toast.error('Invalid referral code');
        return;
      }

      setReferralCode(inputReferralCode.trim());
      localStorage.setItem('referralCode', inputReferralCode.trim());
      toast.success("Referral code applied successfully!");
      setShowReferralInput(false);
    } catch (error) {
      console.error('Referral validation error:', error);
      toast.error('Error validating referral code');
    } finally {
      setIsLoadingReferral(false);
    }
  };

  const handleGoogleAuth = useCallback(async () => {
    if (loginAttemptRef.current || isLoading) {
      toast.error('Login already in progress');
      return;
    }

    try {
      loginAttemptRef.current = true;
      setIsLoading(true);

      const client = getSupabaseClient();

      const { error: authError } = await signInWithProvider('google');

      if (authError) {
        console.error('Google login error:', authError);
        toast.error(authError.message || 'Error signing in with Google');
        return;
      }

      loginTimeoutRef.current = setTimeout(async () => {

        try {
          const { data: { session }, error: sessionError } = await client.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            return;
          }

          if (subscribed && session?.user?.email) {
            try {
              const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: session.user.email }),
              });

              const data = await response.json();

              if (!response.ok) {
                console.error('Newsletter subscription failed:', data.error);
                toast.error(data.error || 'Failed to subscribe to newsletter');
              } else {
                toast.success(data.message || 'Successfully subscribed to newsletter!');
              }
            } catch (error) {
              console.error('Newsletter error:', error);
              toast.error('Failed to subscribe to newsletter');
            }
          }

          router.replace('/dashboard');
        } catch (error: any) {
          console.error('Session error:', error);
          toast.error(error.message || 'Error getting session');
        }
      }, 1000);

    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Error during authentication');
    } finally {
      loginAttemptRef.current = false;
      setIsLoading(false);
    }
  }, [router, subscribed, referralCode]);

  const toggleReferralInput = () => {
    setShowReferralInput(!showReferralInput);
  };

  if (loading) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh]">
      {/* Hero Image Section */}
      <div className="w-full md:w-1/2 relative h-[50vh] md:h-[100dvh]">
        <Image
          src="/login/login-bg-2.jpg"
          alt="Neurolov platform showcasing decentralized GPU compute and AI agents"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
      </div>

      {/* Main Content Section */}
      <div className="w-full md:w-1/2 bg-[#0066FF] flex items-center h-[50vh] md:h-[100dvh] justify-center relative z-10">
        <div className="w-full max-w-[400px] md:max-w-[600px] space-y-4 px-4 md:px-8">

          {/* <h1 className="text-2xl md:text-3xl font-bold text-white text-center leading-tight">
          Decentralized GPU Compute & AI Agents on Solana Blockchain
        </h1>
  
      
        <h2 className="text-lg md:text-xl font-semibold text-white text-center">
          Rent GPUs, Generate AI Models, and Join the NLOV Token Presale
        </h2> */}
          <div className="text-white mb-8 md:mb-12">
            <div className='text-sm md:text-xl font-normal mb-1 md:mb-2'>
              Welcome to
            </div>
            <div className='text-2xl md:text-5xl font-semibold'>
              NEUROLOV
            </div>
          </div>

          <div className="space-y-4">
            {/* Referral code section */}
            {feature_flags.refferalOnSignIn &&  !referralCode &&
              (<div className="text-center">
                <button
                  onClick={toggleReferralInput}
                  className="text-sm text-white underline hover:text-white/80"
                >
                  {showReferralInput ? "Hide referral input" : "Have a referral code?"}
                </button>
              </div>)
            }

            {/* Referral input field */}
            { feature_flags.refferalOnSignIn && showReferralInput && !referralCode && (
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter referral code"
                  value={inputReferralCode}
                  onChange={(e) => setInputReferralCode(e.target.value)}
                  className="bg-white text-[#0066FF]"
                />
                <Button
                  onClick={applyReferralCode}
                  className="bg-white text-[#0066FF] hover:bg-white/90"
                  size="sm"
                  disabled={isLoadingReferral}
                >
                  {isLoadingReferral ? 'Checking...' : 'Apply'}
                </Button>
              </div>
            )}

            <div className="space-y-6 w-full">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-[13px] md:text-lg text-white/90">
                    <span className="text-[#00FF85]">*</span> Email
                  </label>
                  <Input
                    type="email"
                    placeholder="eg. hello@world.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 md:h-16 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-0 text-sm md:text-lg rounded-[4px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-[13px] md:text-lg text-white/90">
                    <span className="text-[#00FF85]">*</span> Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 md:h-16 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-0 text-sm md:text-lg rounded-[4px]"
                  />
                </div>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-[#00FF85] hover:underline text-sm md:text-base"
                  >
                    {isSignUp ? 'Already have an account? Log in' : 'Don\'t have an account? Sign up'}
                  </button>
                </div>
                <Button
                  type="button"
                  className="w-full h-12 md:h-16 bg-white text-[#0066FF] hover:bg-white/90 font-medium text-sm md:text-lg"
                  onClick={async () => {
                    if (!email || !password) {
                      toast.error('Please enter both email and password');
                      return;
                    }
                    setEmailLoading(true);
                    try {
                      if (isSignUp) {
                        const { data, error } = await signUpWithEmail(email, password);
                        console.log('Sign up response:', { data, error });
                        
                        if (error) {
                          toast.error(error.message);
                        } else {
                          // Check if the user needs to confirm their email
                          if (!data?.user?.email_confirmed_at) {
                            toast.success(
                              'Almost there! Please check your email for a verification link. ' +
                              'You need to verify your email before you can sign in.'
                            );
                            // Switch to login mode after successful signup
                            setIsSignUp(false);
                          } else {
                            toast.success('Sign up successful!');
                            router.replace('/dashboard');
                          }
                        }
                      } else {
                        const { data, error } = await signInWithEmail(email, password);
                        if (error) {
                          if (error.message.includes('Email not confirmed')) {
                            toast.error('Please verify your email address first. Check your inbox for the verification link.');
                          } else {
                            toast.error(error.message);
                          }
                        } else if (data) {
                          toast.success('Login successful!');
                          router.replace('/dashboard');
                        }
                      }
                    } catch (err: any) {
                      console.error('Auth error:', err);
                      toast.error(err?.message || 'An error occurred during authentication');
                    } finally {
                      setEmailLoading(false);
                    }
                  }}
                  disabled={emailLoading}
                >
                  {emailLoading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Log in')}
                </Button>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={subscribed}
                      onCheckedChange={(checked) => setSubscribed(checked as boolean)}
                      className="border-white/20 data-[state=checked]:bg-[#00FF85] data-[state=checked]:text-white"
                    />
                    <label
                      htmlFor="newsletter"
                      className="text-[13px] md:text-lg text-white/80 leading-tight cursor-pointer"
                    >
                      Subscribe to newsletter
                    </label>
                  </div>
                  <button className="text-[13px] md:text-lg text-[#00FF85] hover:underline">
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0066FF] px-2 text-white/60">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 md:h-16 bg-white/10 text-white border-white/20 hover:bg-white/20 font-medium text-sm md:text-lg"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Google'}
              </Button>
            </div>
          </div>

          {/* Internal Links */}
          {/* <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 pt-4">
            <Link href="/wallet" title="Connect your crypto wallet to Neurolov" className="text-white underline text-center">Connect Wallet</Link>
            <Link href="/gpublab" title="Explore decentralized GPU compute lab" className="text-white underline text-center">Explore GPU Lab</Link>
            <Link href="/presale" title="Join NLOV Token Presale and participate" className="text-white underline text-center">Join NLOV Token Presale</Link>
          </div> */}
        </div>
      </div>
      

      {/* Decorative Background - Adjusted to cover half the screen */}
      <div className="absolute right-0 top-0 w-full md:w-1/2 h-full pointer-events-none">
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-10 z-10" />
      </div>
    </div>
  );
}
