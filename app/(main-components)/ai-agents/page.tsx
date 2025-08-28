"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles, Zap, Clock, Shield, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateAgentModal from "./components/CreateAgentModal";
import AgentInteractionDialog from "./components/AgentInteractionDialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';

interface Agent {
  name: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
  usageCount?: number;
  performance?: number;
  pricing: {
    monthly: number;
    yearly: number;
    payAsYouGo: number;
  };
  features: string[];
  category: "Essential" | "Professional" | "Enterprise";
  deploymentTime: string;
  securityLevel: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const onChainAgents = [
  {
    name: "Smart Contract Auditor",
    description: "Automated security analysis and vulnerability detection in smart contracts",
    icon: "🛡️",
    status: "active",
    usageCount: 1234,
    performance: 95,
    pricing: {
      monthly: 299,
      yearly: 2990,
      payAsYouGo: 30
    },
    features: [
      "Real-time vulnerability scanning",
      "Gas optimization suggestions",
      "Best practices enforcement",
      "Custom rule creation"
    ],
    category: "Professional",
    deploymentTime: "2-5 min",
    securityLevel: "Enterprise-grade"
  },
  {
    name: "DeFi Portfolio Manager",
    description: "Optimizes yield farming and liquidity provision strategies",
    icon: "📊",
    status: "active",
    usageCount: 856,
    performance: 88,
    pricing: {
      monthly: 199,
      yearly: 1990,
      payAsYouGo: 20
    },
    features: [
      "Automated yield optimization",
      "Risk assessment",
      "Portfolio rebalancing",
      "Market trend analysis",
      "Multi-chain support"
    ],
    category: "Essential",
    deploymentTime: "1-2 minutes",
    securityLevel: "Professional"
  },
  {
    name: "NFT Market Analyzer",
    description: "Tracks and predicts NFT market trends and opportunities",
    icon: "🎨",
    status: "active",
    usageCount: 567,
    performance: 92,
    pricing: {
      monthly: 249,
      yearly: 2490,
      payAsYouGo: 25
    },
    features: [
      "Real-time market data",
      "Trend prediction",
      "Opportunity detection",
      "Customizable alerts",
      "API access"
    ],
    category: "Professional",
    deploymentTime: "2-3 minutes",
    securityLevel: "Enterprise-grade"
  },
  {
    name: "DAO Governance Assistant",
    description: "Helps analyze and participate in DAO governance proposals",
    icon: "⚖️",
    status: "active",
    usageCount: 432,
    performance: 85,
    pricing: {
      monthly: 149,
      yearly: 1490,
      payAsYouGo: 15
    },
    features: [
      "Proposal analysis",
      "Voting assistance",
      "Governance insights",
      "Customizable alerts",
      "API access"
    ],
    category: "Essential",
    deploymentTime: "1-2 minutes",
    securityLevel: "Professional"
  },
  {
    name: "Gas Price Optimizer",
    description: "Optimizes transaction timing based on gas prices",
    icon: "⛽",
    status: "active",
    usageCount: 978,
    performance: 97,
    pricing: {
      monthly: 99,
      yearly: 990,
      payAsYouGo: 10
    },
    features: [
      "Real-time gas price monitoring",
      "Transaction optimization",
      "Customizable alerts",
      "API access"
    ],
    category: "Essential",
    deploymentTime: "1 minute",
    securityLevel: "Professional"
  },
];

const offChainAgents = [
  {
    name: "Market Sentiment Analyzer",
    description: "Analyzes social media and news for market sentiment",
    icon: "📈",
    status: "active",
    usageCount: 789,
    performance: 91,
    pricing: {
      monthly: 149,
      yearly: 1490,
      payAsYouGo: 15
    },
    features: [
      "Real-time sentiment analysis",
      "Multi-source data integration",
      "Customizable alerts",
      "Trend prediction",
      "API access"
    ],
    category: "Essential",
    deploymentTime: "1-3 minutes",
    securityLevel: "Professional"
  },
  {
    name: "Code Generation Assistant",
    description: "Helps generate and optimize code for blockchain applications",
    icon: "💻",
    status: "active",
    usageCount: 1567,
    performance: 94,
    pricing: {
      monthly: 199,
      yearly: 1990,
      payAsYouGo: 20
    },
    features: [
      "Code generation",
      "Code optimization",
      "Customizable templates",
      "API access"
    ],
    category: "Professional",
    deploymentTime: "2-3 minutes",
    securityLevel: "Enterprise-grade"
  },
  {
    name: "Documentation Helper",
    description: "Assists in creating and maintaining project documentation",
    icon: "📝",
    status: "active",
    usageCount: 345,
    performance: 89,
    pricing: {
      monthly: 99,
      yearly: 990,
      payAsYouGo: 10
    },
    features: [
      "Documentation generation",
      "Documentation management",
      "Customizable templates",
      "API access"
    ],
    category: "Essential",
    deploymentTime: "1-2 minutes",
    securityLevel: "Professional"
  },
  {
    name: "Testing Automation",
    description: "Automates testing procedures for blockchain applications",
    icon: "🔧",
    status: "active",
    usageCount: 678,
    performance: 93,
    pricing: {
      monthly: 249,
      yearly: 2490,
      payAsYouGo: 25
    },
    features: [
      "Automated testing",
      "Test case generation",
      "Customizable test suites",
      "API access"
    ],
    category: "Professional",
    deploymentTime: "2-3 minutes",
    securityLevel: "Enterprise-grade"
  },
  {
    name: "Performance Monitor",
    description: "Monitors and optimizes application performance",
    icon: "📊",
    status: "active",
    usageCount: 890,
    performance: 96,
    pricing: {
      monthly: 199,
      yearly: 1990,
      payAsYouGo: 20
    },
    features: [
      "Real-time performance monitoring",
      "Performance optimization",
      "Customizable alerts",
      "API access"
    ],
    category: "Professional",
    deploymentTime: "2-3 minutes",
    securityLevel: "Enterprise-grade"
  },
];

export default function AIAgents() {
  const [isOnChain, setIsOnChain] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly" | "payAsYouGo">("monthly");
  const agents = isOnChain ? onChainAgents : offChainAgents;

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      <ComingSoonOverlay 
        type="fixed"
        title="AI Agents"
        description="Our AI Agents marketplace will be available in Version 2.0. Get ready to deploy powerful AI agents for your blockchain needs!"
        version="2.0"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            AI Agents Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">Deploy powerful AI agents for your blockchain needs</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-4 p-2 rounded-full bg-background/50 backdrop-blur-sm border border-primary/20">
            <span className={`text-sm transition-colors ${!isOnChain ? "text-primary" : "text-muted-foreground"}`}>
              Off-Chain
            </span>
            <Switch
              checked={isOnChain}
              onCheckedChange={setIsOnChain}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm transition-colors ${isOnChain ? "text-primary" : "text-muted-foreground"}`}>
              On-Chain
            </span>
          </div>
          <div className="flex rounded-lg border border-primary/20 p-1">
            <Button
              variant={billingPeriod === "monthly" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBillingPeriod("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === "yearly" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBillingPeriod("yearly")}
            >
              Yearly (-17%)
            </Button>
            <Button
              variant={billingPeriod === "payAsYouGo" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setBillingPeriod("payAsYouGo")}
            >
              Pay-as-you-go
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="wait">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              variants={item}
              layout
              className="group"
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm border border-primary/20 group-hover:border-primary/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                      {agent.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{agent.name}</h3>
                        <Badge variant={
                          agent.category === "Enterprise" ? "destructive" :
                          agent.category === "Professional" ? "default" :
                          "secondary"
                        }>
                          {agent.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Deploy Time:</span>
                      <span className="text-sm">{agent.deploymentTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{agent.securityLevel}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Performance</span>
                        <div className="flex items-center gap-2">
                          <Progress value={agent.performance} className="w-[100px]" />
                          <span className="text-sm font-medium">{agent.performance}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Price</div>
                        <div className="font-bold text-xl">
                          ${billingPeriod === "payAsYouGo" 
                            ? `${agent.pricing.payAsYouGo}/call`
                            : billingPeriod === "yearly"
                            ? `${agent.pricing.yearly}/year`
                            : `${agent.pricing.monthly}/mo`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Key Features</div>
                    <ul className="text-sm space-y-1">
                      {agent.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => setSelectedAgent(agent)}
                    >
                      Try Demo
                    </Button>
                    <Button 
                      className="flex-1"
                      variant="secondary"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Deploy Agent
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Custom Agent Card */}
        <motion.div variants={item} layout>
          <Card 
            className="p-6 border-dashed border-2 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full bg-background/50 backdrop-blur-sm group"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <Button variant="ghost" className="flex items-center space-x-2 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6 text-primary" />
                <span>Create Custom Agent</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChainType={isOnChain}
      />

      <AgentInteractionDialog
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        agent={selectedAgent}
      />
    </div>
  );
}
