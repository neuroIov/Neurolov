'use client';

import "./globals.css";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/app/auth/useUser';
import { signOut } from '@/app/auth/supabase';
import Script from 'next/script';
import { Bell, Search, Wallet, Settings, LayoutDashboard, Cpu, Brain, Coins, Users, Info, LogOut, User, Sparkles, Network, Menu } from 'lucide-react';
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/providers";
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import { AnimatePresence, motion } from "framer-motion";
import PageTransition from "@/components/page-transition";
import { useRouter } from 'next/navigation';
import { LockIcon } from '@/components/LockIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Compute', href: '/gpu-marketplace', icon: Cpu, isNew: true },
  { name: 'AI Models', href: '/ai-models', icon: Brain, isNew: true },
  { name: 'AI Agents', href: '#', icon: Sparkles, isLocked: true, disabled: true },
  { name: 'Earnings', href: '#', icon: Coins, isLocked: true, disabled: true },
  { name: 'Connect to Earn', href: '#', icon: Network, isLocked: true, disabled: true },
  { name: 'Wallet', href: '#', icon: Wallet, isLocked: true, disabled: true },
  { name: 'Community', href: '#', icon: Users, isLocked: true, disabled: true },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'More info', href: '/more-info', icon: Info },
];

const localInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${localInter.variable}`}
      data-sidebar-collapsed={isSidebarCollapsed}
    >
      <head>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-black font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <MainLayout isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed}>
              {children}
            </MainLayout>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

function MainLayout({
  children,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}: {
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Don't show sidebar and header on the sign-in page
  const isSignInPage = pathname === '/';
  if (isSignInPage) {
    return <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">{children}</div>;
  }

  //   // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black grid-background">
      {/* Header */}
      <header className="fixed top-0 z-[100] w-full border-b border-gray-800 bg-black/95">
        <div className="px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu className="h-6 w-6 text-gray-400" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src="/neurolov-logo.svg" alt="Neurolov" className="h-8" />
            </Link>

            
          </div>

          <div className="flex items-center space-x-4">
            {/* Profile Dropdown - Only show when logged in */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 hover:bg-white/5 rounded-lg">
                  <User className="h-6 w-6 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-xl border border-white/10">
                  <DropdownMenuItem
                    className="text-gray-300 hover:text-white focus:text-white cursor-pointer"
                    onClick={() => router.push('/auth/profile')}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-gray-300 hover:text-white focus:text-white cursor-pointer"
                    onClick={handleLogout}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-screen pt-20">
        {/* Navigation Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 border-r border-gray-800 glass z-50 backdrop-blur-xl"
            >
              <nav className="h-full px-4 py-5">
                <div className="space-y-1.5">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={(e) => {
                          if (item.disabled) {
                            e.preventDefault();
                            return;
                          }
                          setIsSidebarCollapsed(true);
                        }}
                        className={`group flex items-center justify-between px-4 py-3.5 text-base font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-white/10 text-white'
                            : item.disabled
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </div>
                        {item.isNew && (
                          <span className="bg-[#40A6FF] text-xs px-2 py-1 rounded-full text-white">
                            New
                          </span>
                        )}
                        {item.isLocked && <LockIcon />}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 px-8 py-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

export default RootLayout;