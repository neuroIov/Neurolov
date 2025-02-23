'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/app/auth/useUser';
import { signInWithProvider, getSupabaseClient } from '@/app/auth/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(true);
  const loginAttemptRef = useRef(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
    
    // Cleanup any pending timeouts
    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
    };
  }, [user, loading, router]);

  const handleGoogleAuth = useCallback(async () => {
    // Prevent multiple login attempts
    if (loginAttemptRef.current || isLoading) {
      toast.error('Login already in progress');
      return;
    }

    try {
      loginAttemptRef.current = true;
      setIsLoading(true);
      
      // Get the Supabase client
      const client = getSupabaseClient();
      
      // Start Google auth
      const { error: authError } = await signInWithProvider('google');
      
      if (authError) {
        console.error('Google login error:', authError);
        toast.error(authError.message || 'Error signing in with Google');
        return;
      }

      // Add a small delay to prevent rapid subsequent attempts
      loginTimeoutRef.current = setTimeout(async () => {
        try {
          // Get the session after successful auth
          const { data: { session }, error: sessionError } = await client.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            return;
          }

          // If user subscribed to newsletter and we have their email, subscribe them
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
          
          // Redirect to dashboard
          router.replace('/dashboard');
        } catch (error: any) {
          console.error('Session error:', error);
          toast.error(error.message || 'Error getting session');
        }
      }, 1000); // 1 second delay
      
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Error during authentication');
    } finally {
      loginAttemptRef.current = false;
      setIsLoading(false);
    }
  }, [router, subscribed]);

  if (loading) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh]">
      {/* Image Section */}
      <div className="w-full md:w-2/3 relative h-[40vh] md:h-[100dvh]">
        <Image
          src="/login/login.png"
          alt="Neurolov Login"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent" />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/3 bg-[#0066FF] flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6 md:space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Sign in to Neurolov
            </h2>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white text-[#0066FF] hover:bg-white/90"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="newsletter"
                checked={subscribed}
                onCheckedChange={(checked) => setSubscribed(checked as boolean)}
                className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#0066FF] mt-1"
              />
              <label
                htmlFor="newsletter"
                className="text-sm text-white leading-tight"
              >
                Subscribe to our newsletter for updates and news
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Circuit Pattern Background for Form Section */}
      <div className="absolute right-0 top-0 w-full md:w-1/3 h-full pointer-events-none">
        <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-10" />
      </div>
    </div>
  );
}