'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SpotLightCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function SpotLightCard({ children, className = '' }: SpotLightCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border border-gray-800 bg-black/20 p-8 backdrop-blur-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
}
