'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BiLogoGmail } from 'react-icons/bi';
import { useUser } from '@/app/auth/useUser';

interface ComingSoonOverlayProps {
  version?: string;
  title?: string;
  description?: string;
  type?: 'hover' | 'fixed' | 'toast' | 'banner';
  className?: string;
  customButton?: React.ReactNode;
}

export const ComingSoonOverlay = ({ 
  version = '2.0', 
  title = 'Coming Soon',
  description = 'This feature will be available soon.',
  type = 'fixed',
  className = '',
  customButton
}: ComingSoonOverlayProps) => {
  const { user } = useUser();
  const DEV_EMAILS = ['nitishmeswal@gmail.com', 'neohex262@gmail.com', 'neurolov.ai@gmail.com', 'jprateek961@gmail.com'];
  const hasDevAccess = user?.email && DEV_EMAILS.includes(user.email);

  // If user is a dev, don't show the overlay
  if (hasDevAccess) {
    return null;
  }

  if (type === 'toast') {
    return (
      <Button
        onClick={() => {
          toast.info(`${title} in Version ${version}! 🚀`, {
            description: description,
            action: {
              label: "Notify Me",
              onClick: () => toast.success('We\'ll notify you when it\'s ready!')
            }
          });
        }}
      >
        {title}
      </Button>
    );
  }

  if (type === 'hover') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 p-4 text-center">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-300">
            {description}
          </p>
          {customButton}
        </div>
      </motion.div>
    );
  }

  if (type === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-lg p-4 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <div className="web3-glow absolute inset-0 opacity-10" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-300">
            {description}
          </p>
        </div>
      </div>
    );
  }

  // Default fixed overlay with blur
  return (
    <div className={`absolute inset-0 z-50 ${type === 'fixed' ? 'backdrop-blur-md bg-black/50' : ''} ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            {title}
          </h3>
          <p className="text-gray-300 text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
