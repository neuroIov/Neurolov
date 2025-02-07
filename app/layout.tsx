'use client';

import "./globals.css";
import React from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { Inter } from 'next/font/google';
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/page-transition";
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/sidebar';
import { SidebarTabProvider } from '@/store/sidebar-tab';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User } from 'lucide-react';

const localInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, supabase } = useUser();

  const handleLogout = async () => {
    try {
    await supabase.auth.signOut();
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

// Show loading state
if (loading) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// Redirect to login for public routes if user is not authenticated
if (!user && !PUBLIC_ROUTES.includes(pathname)) {
  router.push('/login');
  return null;
}

// Redirect to dashboard for public routes if user is authenticated
if (user && PUBLIC_ROUTES.includes(pathname)) {
  router.push('/');
  return null;
}

return (
  <div className="flex h-screen">
    {!PUBLIC_ROUTES.includes(pathname) && <Sidebar />}
    <main className="flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        <PageTransition>{children}</PageTransition>
      </AnimatePresence>
    </main>
  </div>
);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={localInter.className}>
        <ToastProvider>
          <TooltipProvider>
            <MainLayout>{children}</MainLayout>
          </TooltipProvider>
        </ToastProvider>
      </body>
    </html>
  );
}