'use client';

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/gpu-marketplace',
  '/ai-models',
  '/earnings',
  '/connect-to-earn',
  '/wallet'
];

const isProtectedRoute = (path: string) => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && !session && isProtectedRoute(window.location.pathname)) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Check initial user state
    checkUser();

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (!session && isProtectedRoute(window.location.pathname)) {
        router.push('/');
      }
    });

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        {children}
        <Toaster position="bottom-right" />
      </ToastProvider>
    </ThemeProvider>
  );
}
