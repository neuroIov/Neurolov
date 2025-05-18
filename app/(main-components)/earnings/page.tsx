'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Sparkles, Trophy, UserCircle2, Activity, Crown, Award, ChevronDown } from 'lucide-react';
import { GamifiedProfile } from '../../(secondary-components)/community/components/GamifiedProfile';
import { SocialShareModal } from '@/components/modals/SocialShareModal';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/app/auth/supabase';
import { useUser } from '@/app/auth/useUser';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Sample data for earnings chart
const earningsData = [
  { month: 'Jan', earnings: 400 },
  { month: 'Feb', earnings: 600 },
  { month: 'Mar', earnings: 800 },
  { month: 'Apr', earnings: 1000 },
  { month: 'May', earnings: 1200 },
  { month: 'Jun', earnings: 1400 },
];

// Sample leaderboard data
const leaderboardData = [
  { id: 1, name: 'AlphaNeuro', score: 9840, avatar: null },
  { id: 2, name: 'BrainWave', score: 8750, avatar: null },
  { id: 3, name: 'QuantumMind', score: 7600, avatar: null },
  { id: 4, name: 'NeuralPeak', score: 6500, avatar: null },
  { id: 5, name: 'SynapticElite', score: 5400, avatar: null },
  { id: 6, name: 'CortexMaster', score: 4300, avatar: null },
  { id: 7, name: 'NeuroVision', score: 3200, avatar: null },
  { id: 8, name: 'MindMatrix', score: 2100, avatar: null },
  { id: 9, name: 'BrainPulse', score: 1900, avatar: null },
  { id: 10, name: 'NeuronFlux', score: 1800, avatar: null },
];

// Feature flags
const featureFlags = {
  showLeaderboard: false,
  showEarningStatistics: false
};

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isInviteShareModalOpen, setIsInviteShareModalOpen] = useState(false);
  const [refCode, setRefCode] = useState("");
  const router = useRouter();
  const { user } = useUser();
  const [isEarningsExpanded, setIsEarningsExpanded] = useState(true);

  // For production link
  const productionLink = "https://app.neurolov.ai";
  const refMessage = refCode
    ? `Join me on Neurolov! Use my invite link ${productionLink} and referral code ${refCode} to sign up.`
    : `Join me on Neurolov! Use my invite link ${productionLink}`;

  return (
    <>
      <SocialShareModal
        isOpen={isInviteShareModalOpen}
        onClose={() => setIsInviteShareModalOpen(false)}
        referralCode={refCode}
        toastText='Invite'
        inviteLink={`${productionLink}?referral=${encodeURIComponent(refCode)}`}
        title="Invite Friends"
        subTitle="Spread the word and earn rewards!"
        message={refMessage}
      />

      <div className="min-h-[100dvh] h-full w-full bg-black text-white relative overflow-hidden flex flex-col">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,0),rgba(0,0,0,1))]" />
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute top-60 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        <div className="relative flex-1 container mx-auto py-2 sm:py-4 px-0 sm:px-2 max-w-6xl overflow-hidden">
          <div className="relative z-10 h-full pb-16 sm:pb-8">
            {/* Mobile Tabs  */}
            <div className="md:hidden w-full mb-2 px-1">
              <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-black/40 border border-blue-500/20 backdrop-blur-xl">
                  <TabsTrigger 
                    value="profile" 
                    className="flex items-center justify-center gap-1 text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
                  >
                    <UserCircle2 className="w-3 h-3" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="earnings" 
                    className="flex items-center justify-center gap-1 text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                  >
                    <Activity className="w-3 h-3" />
                    <span>Earnings</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="leaderboard" 
                    className="flex items-center justify-center gap-1 text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
                  >
                    <Award className="w-3 h-3" />
                    <span>Leaderboard</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="h-[calc(100vh-10rem)] mt-2 px-1">
                  <GamifiedProfile 
                    setRefCode={setRefCode} 
                    setIsShareModalOpen={setIsInviteShareModalOpen} 
                  />
                </TabsContent>
                
                <TabsContent value="earnings" className="h-[calc(100vh-10rem)] mt-2 px-1">
                  <div className="flex flex-col space-y-3">
                    <Card className="relative overflow-hidden border border-green-500/20 bg-black/40 backdrop-blur-xl">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                              Your Earnings
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-2xl font-bold text-white">1,425</span>
                              <span className="text-sm text-gray-400">Credits</span>
                              <div className="flex items-center text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                                <span>+12.5%</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => setIsEarningsExpanded(!isEarningsExpanded)}
                          >
                            <ChevronDown className={cn("w-4 h-4 transition-transform", isEarningsExpanded && "rotate-180")} />
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <AnimatePresence>
                      {isEarningsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="border border-green-500/20 bg-black/40 backdrop-blur-xl overflow-hidden">
                            <div className="p-3">
                              <h3 className="text-md font-semibold text-white mb-3">Earning Statistics</h3>
                              <div className="my-20 text-center text-md font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                Coming Soon...
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Card className="bg-black/40 border border-blue-500/20 backdrop-blur-xl p-3">
                      <h3 className="text-sm font-semibold text-white mb-3">Earning Sources</h3>
                      {featureFlags.showEarningStatistics ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Trophy className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm text-white">Achievements</p>
                                <p className="text-xs text-gray-400">Daily & Special Quests</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-blue-400">850 ₦</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm text-white">Mining</p>
                                <p className="text-xs text-gray-400">AI Processing</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-green-400">425 ₦</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <UserCircle2 className="w-4 h-4 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-sm text-white">Referrals</p>
                                <p className="text-xs text-gray-400">Friend Invites</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-purple-400">150 ₦</p>
                          </div>
                        </div>
                      ) : (
                        <div className="my-8 text-center text-md font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                          Coming Soon...
                        </div>
                      )}
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="leaderboard" className="h-fit mt-2 px-1">
                  <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-xl p-4 h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Global Leaderboard
                      </h2>
                    </div>
                    {!featureFlags.showLeaderboard && (
                      <div className="my-32 text-center text-md font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">Coming Soon...</div>
                    )}
                    {featureFlags.showLeaderboard && (
                      <div className="h-[90%] overflow-y-auto pr-1 no-scrollbar">
                        <div className="space-y-2">
                          {leaderboardData.map((user, index) => (
                            <motion.div
                              key={user.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "flex items-center p-3 rounded-lg",
                                index === 0 ? "bg-yellow-500/10 border border-yellow-500/20" :
                                index === 1 ? "bg-gray-300/10 border border-gray-300/20" :
                                index === 2 ? "bg-amber-600/10 border border-amber-600/20" :
                                "bg-black/20 border border-blue-500/10"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                                  index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                  index === 1 ? "bg-gray-300/20 text-gray-300" :
                                  index === 2 ? "bg-amber-600/20 text-amber-500" :
                                  "bg-gray-500/20 text-gray-400"
                                )}>
                                  {index + 1}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                                  {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                                  {index !== 0 && <UserCircle2 className="w-4 h-4 text-gray-400" />}
                                </div>
                                <div>
                                  <p className={cn(
                                    "text-sm font-medium",
                                    index === 0 ? "text-yellow-400" :
                                    index === 1 ? "text-gray-300" :
                                    index === 2 ? "text-amber-500" :
                                    "text-white"
                                  )}>
                                    {user.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Sparkles className={cn(
                                  "w-3 h-3",
                                  index === 0 ? "text-yellow-400" :
                                  index === 1 ? "text-gray-300" :
                                  index === 2 ? "text-amber-500" :
                                  "text-blue-400"
                                )} />
                                <span className={cn(
                                  "text-sm font-bold",
                                  index === 0 ? "text-yellow-400" :
                                  index === 1 ? "text-gray-300" :
                                  index === 2 ? "text-amber-500" :
                                  "text-blue-400"
                                )}>
                                  {user.score}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid h-full grid-cols-10 gap-2 sm:gap-4 px-2">
              {/* Profile Section */}
              <div className="md:col-span-4 lg:col-span-3 h-[calc(100vh-2rem)]">
                <div className="h-full space-y-2 sm:space-y-4 overflow-hidden">
                  <GamifiedProfile 
                    setRefCode={setRefCode} 
                    setIsShareModalOpen={setIsInviteShareModalOpen} 
                  />
                </div>
              </div>

              {/*  Earnings */}
              <div className="md:col-span-6 lg:col-span-4 h-[calc(100vh-2rem)] flex flex-col space-y-3 overflow-hidden">
                <Card className="relative overflow-hidden border border-green-500/20 bg-black/40 backdrop-blur-xl flex-shrink-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                          Your Earnings
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-2xl font-bold text-white">1,425</span>
                          <span className="text-sm text-gray-400">Credits</span>
                          <div className="flex items-center text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                            <span>+12.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-green-500/20 bg-black/40 backdrop-blur-xl overflow-hidden flex-grow">
                  <div className="h-full p-3">
                    {featureFlags.showEarningStatistics ? (
                      <>
                        <ResponsiveContainer width="100%" height="50%">
                          <AreaChart data={earningsData}>
                            <defs>
                              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#4B5563" />
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
                              stroke="#34D399"
                              fillOpacity={1}
                              fill="url(#colorEarnings)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>

                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-white mb-3">Earning Sources</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <Trophy className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-white">Achievements</p>
                                  <p className="text-xs text-gray-400">Daily & Special Quests</p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-blue-400">850 ₦</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <Activity className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-white">Mining</p>
                                  <p className="text-xs text-gray-400">AI Processing</p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-green-400">425 ₦</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                  <UserCircle2 className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-white">Referrals</p>
                                  <p className="text-xs text-gray-400">Friend Invites</p>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-purple-400">150 ₦</p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col">
                        <h3 className="text-md font-semibold text-white mb-3">Earning Statistics</h3>
                        <div className="flex-grow flex items-center justify-center">
                          <div className="text-center text-md font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                            Coming Soon...
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/*  Leaderboard */}
              <div className="hidden lg:block lg:col-span-3 h-fit">
                <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-xl p-4 h-full overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Global Leaderboard
                    </h2>
                  </div>
                  
                  {!featureFlags.showLeaderboard && (
                    <div className="my-32 text-center text-md font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">Coming Soon...</div>
                  )}
                  
                  {featureFlags.showLeaderboard && (
                    <div className="h-[calc(100%-2rem)] overflow-y-auto pr-1 no-scrollbar">
                      <div className="space-y-2">
                        {leaderboardData.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "flex items-center p-3 rounded-lg",
                              index === 0 ? "bg-yellow-500/10 border border-yellow-500/20" :
                              index === 1 ? "bg-gray-300/10 border border-gray-300/20" :
                              index === 2 ? "bg-amber-600/10 border border-amber-600/20" :
                              "bg-black/20 border border-blue-500/10"
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                                index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                index === 1 ? "bg-gray-300/20 text-gray-300" :
                                index === 2 ? "bg-amber-600/20 text-amber-500" :
                                "bg-gray-500/20 text-gray-400"
                              )}>
                                {index + 1}
                              </div>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                                {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                                {index !== 0 && <UserCircle2 className="w-4 h-4 text-gray-400" />}
                              </div>
                              <div>
                                <p className={cn(
                                  "text-sm font-medium",
                                  index === 0 ? "text-yellow-400" :
                                  index === 1 ? "text-gray-300" :
                                  index === 2 ? "text-amber-500" :
                                  "text-white"
                                )}>
                                  {user.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className={cn(
                                "w-3 h-3",
                                index === 0 ? "text-yellow-400" :
                                index === 1 ? "text-gray-300" :
                                index === 2 ? "text-amber-500" :
                                "text-blue-400"
                              )} />
                              <span className={cn(
                                "text-sm font-bold",
                                index === 0 ? "text-yellow-400" :
                                index === 1 ? "text-gray-300" :
                                index === 2 ? "text-amber-500" :
                                "text-blue-400"
                              )}>
                                {user.score}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
