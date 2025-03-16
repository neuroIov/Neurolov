'use client';

import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, TrendingUp, BarChart2, Bot, Shield, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiAssistantCardProps {
  tier: {
    name: string;
    multiplier: string;
    color: string;
    features: string[];
  };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AiAssistantCard({ tier, index, isSelected, onSelect }: AiAssistantCardProps) {
  const iconMap: { [key: string]: JSX.Element } = {
    'Basic optimization': <Settings className="h-4 w-4" />,
    'Market insights': <BarChart2 className="h-4 w-4" />,
    '24/7 monitoring': <Clock className="h-4 w-4" />,
    'Advanced strategies': <Brain className="h-4 w-4" />,
    'Predictive analytics': <TrendingUp className="h-4 w-4" />,
    'Auto-rebalancing': <Bot className="h-4 w-4" />,
    'Expert optimization': <Sparkles className="h-4 w-4" />,
    'Custom strategies': <Shield className="h-4 w-4" />,
    'Priority execution': <Zap className="h-4 w-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.1 }}
      className={`relative group cursor-pointer ${
        isSelected ? 'ring-2 ring-[#40A6FF]' : ''
      }`}
      onClick={onSelect}
    >
      <div className="bg-gradient-to-br from-black/10 to-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/5 h-full transition-all duration-300 group-hover:border-[#40A6FF]/50">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>

        {/* Multiplier Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
          className="absolute -top-3 -right-3"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${tier.color}, ${tier.color}88)` }}
          >
            {/* Animated Glow Effect */}
            <div className="absolute inset-0 opacity-50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-glow" />
            </div>
            <span className="relative z-10">{tier.multiplier}</span>
          </div>
        </motion.div>

        {/* Card Content */}
        <div className="relative z-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="text-xl font-bold text-white mb-4"
          >
            {tier.name}
          </motion.h3>

          {/* AI Visual Element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="mb-6"
          >
            <div className="relative h-24 w-full rounded-lg overflow-hidden mb-4">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${tier.color}, transparent)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain
                  className="h-12 w-12 text-white opacity-50"
                  style={{ color: tier.color }}
                />
              </div>
              {/* Animated Particles */}
              <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-white/50"
                    initial={{ scale: 0, x: "50%", y: "50%" }}
                    animate={{
                      scale: [0, 1, 0],
                      x: ["50%", `${30 + Math.random() * 40}%`],
                      y: ["50%", `${30 + Math.random() * 40}%`],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <ul className="space-y-3">
            {tier.features.map((feature, fIndex) => (
              <motion.li
                key={fIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 + fIndex * 0.1 }}
                className="flex items-center space-x-2 text-gray-400"
              >
                <span className="text-[#40A6FF]">
                  {iconMap[feature] || <Sparkles className="h-4 w-4" />}
                </span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* Activation Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="mt-6"
          >
            <Button
              className="w-full bg-gradient-to-r from-[#40A6FF] to-[#2D63FF] hover:from-[#2D63FF] hover:to-[#40A6FF] text-white font-medium py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-[#40A6FF]/20 relative overflow-hidden group"
            >
              <span className="relative z-10">Activate {tier.name}</span>
              {/* Button Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-glow" />
              </div>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
