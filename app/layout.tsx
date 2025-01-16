'use client';

import "./globals.css";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/hooks/useUser';
import { Bell, Search, Wallet, Settings, LayoutDashboard, Cpu, Brain, Coins, Users, Info, LogOut, User, Sparkles } from 'lucide-react';
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/providers";
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/page-transition";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'GPU Marketplace', href: '/gpu-marketplace', icon: Cpu },
  { name: 'AI Models', href: '/ai-models', icon: Brain },
  { name: 'AI Agents', href: '/ai-agents', icon: Sparkles },
  { name: 'Earnings', href: '/earnings', icon: Coins },
  { name: 'Connect to Earn', href: '/connect-to-earn', icon: Cpu },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'More info', href: '/more-info', icon: Info },
];

const localInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const { user, loading, supabase } = useUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Don't show sidebar and header on the sign-in page
  const isSignInPage = pathname === '/';
  if (isSignInPage || loading) {
    return <div className="min-h-screen bg-black">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-black grid-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-800 glass">
        <div className="px-8 h-20 flex items-center justify-between">
          <div className="flex items-center flex-1 space-x-12">
            {/* Logo */}
            <Link href="/" className="flex items-center glow">
              <span className="text-4xl font-bold tracking-tight">
                NEURO<span className="text-[#40A6FF]">LOV</span>
              </span>
            </Link>

            {/* Search */}
            <div className="relative flex-1 hidden md:block max-w-3xl">
              <input
                type="text"
                placeholder="Search for something"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-5 py-2 bg-white/5 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#40A6FF] glass text-lg"
              />
              <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-3 hover:bg-white/5 rounded-lg glass glow">
              <Bell className="h-6 w-6 text-gray-400" />
            </button>

            {/* Profile Dropdown - Only show when logged in */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="p-2 hover:bg-white/5 rounded-lg glass glow">
                  <User className="h-6 w-6 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-xl border border-white/10">
                  <DropdownMenuItem 
                    className="text-gray-300 hover:text-white focus:text-white cursor-pointer"
                    onClick={() => router.push('/profile')}
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
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 border-r border-gray-800 glass">
          <nav className="h-full px-4 py-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-4 px-5 py-4 text-lg font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-6 w-6 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pl-72">
          <div className="h-full">
            <AnimatePresence mode="wait">
              <PageTransition key={pathname}>
                {children}
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${localInter.variable}`}
    >
      <head>
      <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){
          w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PQGGRR2Z');</script>
      <!-- End Google Tag Manager -->

      </head>


      <body className="min-h-screen bg-black font-sans antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PQGGRR2Z"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <Providers>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}