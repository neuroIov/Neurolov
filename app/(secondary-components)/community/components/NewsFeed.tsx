'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Rocket, Star, Gift, Award, TrendingUp, MessageCircle, Share2, Heart, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: number;
  type: 'update' | 'announcement' | 'feature' | 'reward' | 'milestone';
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  icon?: React.ReactNode;
}

const newsData: NewsItem[] = [
  {
    id: 1,
    type: 'feature',
    title: '🚀 New AI Models Available',
    content: 'Introducing 5 new state-of-the-art AI models for image generation and processing. Try them out now!',
    timestamp: '2025-01-30T10:00:00Z',
    likes: 245,
    comments: 42,
    shares: 89,
    tags: ['AI', 'NewFeature'],
    icon: <Rocket className="text-purple-400" />
  },
  {
    id: 2,
    type: 'reward',
    title: '🎁 Weekly Mining Rewards Doubled',
    content: 'For the next week, all mining rewards are doubled! Connect your GPU and start earning more.',
    timestamp: '2025-01-29T15:30:00Z',
    likes: 567,
    comments: 89,
    shares: 234,
    tags: ['Mining', 'Rewards'],
    icon: <Gift className="text-yellow-400" />
  },
  {
    id: 3,
    type: 'milestone',
    title: '🏆 Community Milestone',
    content: 'We\'ve reached 10,000 active GPU contributors! Thank you for being part of this journey.',
    timestamp: '2025-01-28T09:15:00Z',
    likes: 789,
    comments: 156,
    shares: 345,
    tags: ['Milestone', 'Community'],
    icon: <Award className="text-blue-400" />
  },
  {
    id: 4,
    type: 'update',
    title: '⚡ Platform Performance Update',
    content: 'Latest update brings 30% faster GPU task distribution and improved earnings tracking.',
    timestamp: '2025-01-27T14:45:00Z',
    likes: 432,
    comments: 67,
    shares: 123,
    tags: ['Update', 'Performance'],
    icon: <Zap className="text-green-400" />
  }
];

export const NewsFeed: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Featured News */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300" />
        <Card className="relative overflow-hidden border border-blue-500/20 bg-black/40 backdrop-blur-xl">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                What's New in NeuroLov
              </h2>
            </div>
            <p className="text-gray-400">
              Stay updated with the latest features, announcements, and community highlights.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* News Items */}
      <AnimatePresence>
        {newsData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300" />
            <Card className="relative border border-blue-500/20 bg-black/40 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
              
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <p className="text-gray-300">{item.content}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Interaction Stats */}
                <div className="flex gap-6 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{item.likes}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{item.comments}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{item.shares}</span>
                  </motion.button>
                </div>
              </div>

              {/* Animated Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
