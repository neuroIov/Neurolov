'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Sector } from 'recharts';
import { Sparkles, TrendingUp, Users, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AiAssistantCard from '@/components/AiAssistant/AiAssistantCard';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';

const data = [
  { name: 'Jan', earnings: 400 },
  { name: 'Feb', earnings: 600 },
  { name: 'Mar', earnings: 800 },
  { name: 'Apr', earnings: 1000 },
  { name: 'May', earnings: 1200 },
  { name: 'Jun', earnings: 1400 },
];

const pieData = [
  { name: 'GPU Rental', value: 60, description: 'Earnings from GPU rentals' },
  { name: 'AI Models', value: 30, description: 'Revenue from AI model usage' },
  { name: 'Referrals', value: 10, description: 'Earnings from referral program' },
];

const COLORS = ['#40A6FF', '#2D63FF', '#6366F1'];

const aiTiers = [
  {
    name: 'Tier 1',
    multiplier: '2x',
    color: '#40A6FF',
    features: ['Basic optimization', 'Market insights', '24/7 monitoring'],
  },
  {
    name: 'Tier 2',
    multiplier: '4x',
    color: '#2D63FF',
    features: ['Advanced strategies', 'Predictive analytics', 'Auto-rebalancing'],
  },
  {
    name: 'Tier 3',
    multiplier: '8x',
    color: '#6366F1',
    features: ['Expert optimization', 'Custom strategies', 'Priority execution'],
  },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function EarningsPage() {
  const [selectedTier, setSelectedTier] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <div className="relative p-8 space-y-8">
      <ComingSoonOverlay 
        type="fixed"
        title="Earnings Dashboard"
        description="Track your earnings and optimize your resources in the next version."
        version="2.0"
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#40A6FF] to-[#2D63FF] text-transparent bg-clip-text">
          Earnings Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-black/10 to-black/30 backdrop-blur-lg rounded-xl p-4 border border-white/5">
            <p className="text-gray-400 text-sm">Total Earnings</p>
            <p className="text-2xl font-bold text-white">$1,400.00</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-black/10 to-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/5"
        >
          <h2 className="text-xl font-bold text-white mb-4">Earnings Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#40A6FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#40A6FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#40A6FF"
                fillOpacity={1}
                fill="url(#colorEarnings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-black/10 to-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/5"
        >
          <h2 className="text-xl font-bold text-white mb-4">Earnings Distribution</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg p-4">
                          <p className="text-white font-medium text-lg mb-1">{payload[0].name}</p>
                          <p className="text-[#40A6FF] font-bold text-2xl">{payload[0].value}%</p>
                          <p className="text-gray-400 text-sm mt-2">
                            {pieData[payload[0].payload.index]?.description}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center space-x-8 mt-4">
              {pieData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center space-x-2 cursor-pointer group"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeIndex === index ? 'scale-150' : 'scale-100'
                    }`}
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className={`text-sm transition-all duration-300 ${
                    activeIndex === index ? 'text-white' : 'text-gray-400'
                  }`}>
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">AI Earnings Assistant</h2>
          <div className="px-3 py-1 rounded-full bg-[#40A6FF]/10 border border-[#40A6FF]/20">
            <span className="text-sm font-medium text-[#40A6FF]">Powered by AI</span>
          </div>
        </div>
        
        <div className="relative">
          {/* Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#40A6FF]/5 via-transparent to-[#2D63FF]/5 rounded-xl blur-3xl" />
          
          <div className="relative">
            <p className="text-gray-400 max-w-2xl">
              Boost your earnings with our AI-powered optimization assistant. Our advanced algorithms analyze market trends
              and optimize your resource allocation in real-time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {aiTiers.map((tier, index) => (
                <AiAssistantCard
                  key={tier.name}
                  tier={tier}
                  index={index}
                  isSelected={selectedTier === index}
                  onSelect={() => setSelectedTier(index)}
                />
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-black/10 to-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/5"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-[#40A6FF]" />
                  <h3 className="text-lg font-semibold text-white">Average Boost</h3>
                </div>
                <p className="text-3xl font-bold text-white">+147%</p>
                <p className="text-sm text-gray-400 mt-1">From AI optimization</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-black/10 to-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/5"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-5 w-5 text-[#40A6FF]" />
                  <h3 className="text-lg font-semibold text-white">Active Users</h3>
                </div>
                <p className="text-3xl font-bold text-white">2.4k</p>
                <p className="text-sm text-gray-400 mt-1">Using AI assistant</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-black/10 to-black/30 backdrop-blur-lg rounded-xl p-6 border border-white/5"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Brain className="h-5 w-5 text-[#40A6FF]" />
                  <h3 className="text-lg font-semibold text-white">AI Trades</h3>
                </div>
                <p className="text-3xl font-bold text-white">1.2M</p>
                <p className="text-sm text-gray-400 mt-1">Optimized decisions</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
