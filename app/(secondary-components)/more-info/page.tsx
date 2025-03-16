'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Info,
  HelpCircle,
  Book,
  MessageCircle,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  MessageSquare,
  Cpu,
  Shield,
  Zap,
  DollarSign,
  Users,
  BarChart,
  Network,
  Lock,
  Cloud,
  Code
} from 'lucide-react';

export default function MoreInfoPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const features = [
    { icon: Cpu, title: 'High Performance', description: 'Access to powerful GPUs for intensive computing tasks' },
    { icon: Shield, title: 'Enterprise Security', description: 'End-to-end encryption and secure infrastructure' },
    { icon: Zap, title: 'Low Latency', description: 'Optimized network for minimal latency and maximum throughput' },
    { icon: DollarSign, title: 'Cost Effective', description: 'Pay only for the resources you use with transparent pricing' },
    { icon: Users, title: 'Community Driven', description: 'Strong community of developers and GPU providers' },
    { icon: BarChart, title: 'Real-time Analytics', description: 'Detailed metrics and performance monitoring' }
  ];

  const stats = [
    { icon: Network, label: 'Network Size', value: '10,000+', suffix: 'GPUs' },
    { icon: Users, label: 'Active Users', value: '50,000+', suffix: 'Users' },
    { icon: Cloud, label: 'Total Compute', value: '1.5', suffix: 'PFLOPS' },
    { icon: Lock, label: 'Security Score', value: '99.9%', suffix: 'Uptime' }
  ];

  const socials = [
    { icon: Github, label: 'GitHub', link: 'https://github.com/neuroIov', color: 'hover:text-gray-400' },
    { icon: Twitter, label: 'Twitter', link: 'https://twitter.com/neurolov', color: 'hover:text-blue-400' },
    { icon: Linkedin, label: 'LinkedIn', link: 'https://www.linkedin.com/company/103657031/', color: 'hover:text-blue-600' },
    { icon: MessageSquare, label: 'Discord', link: 'https://discord.gg/cyVmj2nnUq', color: 'hover:text-indigo-400' },
    { icon: Globe, label: 'Website', link: 'https://neurolov.ai', color: 'hover:text-green-400' },
    { icon: Mail, label: 'Email', link: 'support@neurolov.ai', color: 'hover:text-red-400' }
  ];

  return (
    <motion.div
      className="container mx-auto p-6 space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-6">
          Welcome to Neurolov
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          The future of decentralized GPU computing is here. Join thousands of users and providers in our revolutionary platform.
        </p>
      </motion.div>

      {/* About Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/20">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Info className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">About Our Platform</h2>
              <p className="text-gray-400 leading-relaxed mb-6 text-lg">
                Compute is a revolutionary decentralized computing platform that connects GPU providers with users seeking computing power. 
                Our platform enables seamless access to distributed computing resources while ensuring security, efficiency, and fair compensation for all participants.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-4 rounded-xl bg-black/30 border border-blue-500/10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className="w-6 h-6 text-blue-400 mb-3" />
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <stat.icon className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-xs text-blue-400">{stat.suffix}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Technical Features */}
      <motion.div variants={itemVariants}>
        <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/20">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Code className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Technical Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">For Developers</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center">
                      <Shield className="w-5 h-5 text-green-400 mr-2" />
                      Enterprise-grade security protocols
                    </li>
                    <li className="flex items-center">
                      <Code className="w-5 h-5 text-blue-400 mr-2" />
                      RESTful API integration
                    </li>
                    <li className="flex items-center">
                      <Cloud className="w-5 h-5 text-purple-400 mr-2" />
                      Scalable infrastructure
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">For Providers</h3>
                  <ul className="space-y-3 text-gray-400">
                    <li className="flex items-center">
                      <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
                      Automated payments
                    </li>
                    <li className="flex items-center">
                      <BarChart className="w-5 h-5 text-red-400 mr-2" />
                      Performance monitoring
                    </li>
                    <li className="flex items-center">
                      <Network className="w-5 h-5 text-indigo-400 mr-2" />
                      Network optimization
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Connect Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Connect With Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {socials.map((social, index) => (
              <motion.a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center p-4 rounded-xl bg-black/30 ${social.color} transition-colors duration-300`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className="w-6 h-6 mb-2" />
                <span className="text-sm">{social.label}</span>
              </motion.a>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Support Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-blue-500/20">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Need Help?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 to help you with any questions or issues you may encounter.
              Reach out through any of our channels for quick assistance.
            </p>
            <motion.button
              className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = 'https://forms.gle/bz1i8id5tPWeWFSv6'}
            >
              Contact Support
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
