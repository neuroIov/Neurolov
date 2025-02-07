'use client';

import { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { ToastProvider } from "@/components/ui/toast";

interface ProvidersProps extends ThemeProviderProps {
  children: ReactNode;
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      {...props}
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </NextThemesProvider>
  );
}
