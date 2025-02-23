'use client';

// Override logs in all environments.
if (typeof window !== 'undefined') {
  const originalConsoleLog = console.log;
  console.log = (...args: any[]) => {
    // Filter out logs containing sensitive keywords
    if (
      args.some(
        arg =>
          typeof arg === 'string' &&
          (arg.includes('User:') || arg.includes('Is Dev:'))
      )
    ) {
      return;
    }
    originalConsoleLog(...args);
  };
}

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Brain,
  Search,
  Filter,
  Zap,
  Loader2,
  ShoppingBag,
  Star,
  Info,
  CheckCircle,
  Cpu,
  HardDrive,
  Box,
  ImageIcon,
  Video,
  Music,
  Bot,
  MessageSquare,
  Rocket,
  Trash2,
  ArrowRight,
  Heart,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { models } from './options/models';
import { categoryToType } from './options/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { GPU, gpuData } from '@/constants/values';
import { GPULabClient } from '@/app/gpulab/gpulab-service';
import { useModelBag } from '@/store/model-bag';
import { CheckIcon } from '@/components/icons/CheckIcon';
import Image from 'next/image';
import ModelStatus from "@/app/gpulab/model-status";
import { useUser } from '@/app/auth/useUser';
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// Import Badge from your UI components (adjust the path as needed)
import { Badge } from '@/components/ui/badge';

const DEV_EMAILS = ['nitishmeswal@gmail.com', 'neohex262@gmail.com', 'test@example.com', 'jprateek961@gmail.com', 'aitipamulaprapitesh02@gmail.com'];

interface DeployedContainer {
  id: string;
  container_address: string;
  model_name: string;
  model_type: string;
  model_description: string;
  model_features: string[];
}

const getModelIcon = (type: string) => {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    case 'api':
      return <Zap className="w-6 h-6 text-yellow-500" />;
    case 'agent':
      return <Bot className="w-6 h-6 text-purple-500" />;
    case 'audio':
      return <Music className="w-6 h-6 text-pink-500" />;
    case 'video':
      return <Video className="w-6 h-6 text-red-500" />;
    case 'text':
      return <MessageSquare className="w-6 h-6 text-green-500" />;
    case '3d':
      return <Box className="w-6 h-6 text-orange-500" />;
    default:
      return <Brain className="w-6 h-6 text-blue-500" />;
  }
};

// Reusable Badge Components (beautified)
const NewTag = () => (
  <Badge
    variant="secondary"
    className="absolute z-50 top-2 left-2 px-3 py-1 text-xs font-semibold tracking-wide bg-gradient-to-r from-blue-500 to-cyan-500 text-white border border-transparent rounded-full shadow-md transform hover:scale-105 transition-transform duration-300"
  >
    NEW
  </Badge>
);

const BetaTag = () => (
  <Badge
    variant="secondary"
    className="absolute z-50 top-2 left-16 px-3 py-1 text-xs font-semibold tracking-wide bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-transparent rounded-full shadow-md transform hover:scale-105 transition-transform duration-300"
  >
    BETA
  </Badge>
);

export default function AIModelsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [view, setView] = useState<'explore' | 'my-models'>('explore');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [modelToView, setModelToView] = useState<AIModel | null>(null);
  const MAX_GENERATIONS = 5;

  const { selectedModel, setSelectedModel } = useModelBag();

  const [deployedContainers, setDeployedContainers] = useState<DeployedContainer[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { user } = useUser();
  const isDev = user?.email && DEV_EMAILS.includes(user.email);

  console.log('User:', user?.email);
  console.log('Is Dev:', isDev);

  const [modelLikes, setModelLikes] = useState<Record<string, { count: number, isLiked: boolean }>>({});

  // Patched realtime like subscription and initialization
  useEffect(() => {
    let channel;

    const initializeLikes = async () => {
      // Initialize with base counts for all models
      const initialLikes: Record<string, { count: number, isLiked: boolean }> = {};
      models.forEach(model => {
        initialLikes[model.id] = {
          count: 7869,
          isLiked: false
        };
      });
      setModelLikes(initialLikes);

      if (!user) return;

      try {
        // Fetch actual like counts
        const { data: likeCounts, error: likeError } = await supabase
          .from('model_like_counts')
          .select('model_id, like_count');
        if (likeError) throw likeError;

        // Fetch user's liked models
        const { data: userLikes, error: userError } = await supabase
          .from('model_likes')
          .select('model_id')
          .eq('user_id', user.id);
        if (userError) throw userError;

        const userLikedModels = new Set(userLikes?.map(like => like.model_id) || []);

        // Update initialLikes with fetched counts and user likes
        likeCounts?.forEach(count => {
          if (initialLikes[count.model_id]) {
            initialLikes[count.model_id].count = count.like_count;
          }
        });
        userLikedModels.forEach(modelId => {
          if (initialLikes[modelId]) {
            initialLikes[modelId].isLiked = true;
          }
        });
        setModelLikes(initialLikes);

        // Setup realtime subscription
        channel = supabase
          .channel('model_likes_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'model_likes'
            },
            async (payload) => {
              // Fetch updated counts when a change occurs
              const { data: updatedCounts, error: updateError } = await supabase
                .from('model_like_counts')
                .select('model_id, like_count');
              if (!updateError && updatedCounts) {
                setModelLikes(prev => {
                  const newLikes = { ...prev };
                  updatedCounts.forEach(count => {
                    if (newLikes[count.model_id]) {
                      newLikes[count.model_id] = {
                        ...newLikes[count.model_id],
                        count: count.like_count
                      };
                    }
                  });
                  return newLikes;
                });
              }
            }
          );
        await channel.subscribe();
      } catch (error) {
        console.error('Error fetching likes:', error);
        toast.error('Failed to fetch likes');
      }
    };

    initializeLikes();

    // Cleanup subscription synchronously
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user, supabase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setModelLikes(prev => {
        const newLikes = { ...prev };
        Object.keys(newLikes).forEach(modelId => {
          newLikes[modelId] = {
            ...newLikes[modelId],
            count: newLikes[modelId].count + 1
          };
        });
        return newLikes;
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const handleLike = async (modelId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click

    if (!user) {
      toast.error('Please sign in to like models');
      return;
    }

    try {
      const currentLike = modelLikes[modelId];
      if (!currentLike) return;

      if (currentLike.isLiked) {
        // Unlike
        const { error } = await supabase
          .from('model_likes')
          .delete()
          .eq('model_id', modelId)
          .eq('user_id', user.id);

        if (error) throw error;

        setModelLikes(prev => ({
          ...prev,
          [modelId]: {
            count: Math.max(7869, prev[modelId].count - 1),
            isLiked: false
          }
        }));
      } else {
        // Like
        const { error } = await supabase
          .from('model_likes')
          .insert({
            model_id: modelId,
            user_id: user.id
          });

        if (error) throw error;

        setModelLikes(prev => ({
          ...prev,
          [modelId]: {
            count: prev[modelId].count + 1,
            isLiked: true
          }
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleAddToBag = async (model: AIModel) => {
    try {
      // Special handling for specific models
      if (model.id === 'neurolov-image') {
        router.push('/neurolov-image');
        return;
      }

      if (model.id === 'music-ai') {
        router.push('/ai-models/music-ai');
        return;
      }

      if (model.id === 'uncensored-chat') {
        router.push('/ai-models/uncensored-chat');
        return;
      }

      if (model.id === 'text-to-3d') {
        router.push('/ai-models/text-to-3d');
        return;
      }

      if (model.id === 'video') {
        router.push('/ai-models/video');
        return;
      }

      if (model.id === 'deepfake') {
        router.push('/ai-models/deepfake');
        return;
      }

      // Default handling for other models
      setSelectedModel(model);

      // Get volume identifier
      const client = GPULabClient.getInstance();
      const volumeIdentifier = await client.getVolumeIdentifier();

      // Store in localStorage
      localStorage.setItem('pytorch_deployment', JSON.stringify({
        volume_identifier: volumeIdentifier
      }));

      router.push('/gpu-marketplace');
    } catch (error) {
      console.error('Error adding model to bag:', error);
      toast({
        title: "Error",
        description: "Failed to add model to bag. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDemo = async (model: AIModel) => {
    if (model.id === 'flux-image') {
      setIsDemoOpen(true);
    } else if (model.id === 'neurolov-image') {
      router.push('/neurolov-image');
    }
  };

  const filteredModels = useMemo(() => {
    if (selectedCategory === "All") return models;
    return models.filter(model =>
      categoryToType[selectedCategory as keyof typeof categoryToType] === model.type
    );
  }, [selectedCategory]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime(time => Math.max(0, time - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  useEffect(() => {
    const fetchContainers = async () => {
      if (view === 'my-models') {
        try {
          const client = GPULabClient.getInstance();
          const containers = await client.getContainerList();
          setDeployedContainers(containers.map(container => ({ ...container, model_type: container.model_type || 'text' })));
        } catch (error) {
          console.error('Error fetching containers:', error);
        }
      }
    };

    fetchContainers();
    const interval = setInterval(fetchContainers, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [view]);

  const handleDeleteModel = async (container: DeployedContainer) => {
    try {
      setIsDeleting(container.container_address);
      const client = GPULabClient.getInstance();
      await client.deleteContainer(container.container_address);
      toast.success('Model deleted successfully');
      // Refresh the list
      const containers = await client.getContainerList();
      setDeployedContainers(containers.map(container => ({ ...container, model_type: container.model_type || 'text' })));
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      {/* Fixed Header with higher z-index */}
      <header className="fixed top-0 left-0 w-full z-60 bg-black shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-white text-xl font-bold">My App Header</h1>
        </div>
      </header>

      {/* Main Content with top padding to prevent overlap */}
      <main className="pt-20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-8">
            {/* Search and Filter Section */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 bg-[#1A1A1A] border-none rounded-xl text-white"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {view === 'explore' ? (
                filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className="relative bg-[#141414] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* New & Beta Badges */}
                    <NewTag />
                    <BetaTag />

                    {/* Coming Soon Overlay for all models except neurolov-image and dev users */}
                    {model.id !== 'neurolov-image' && !isDev && (
                      <div className="absolute inset-0 z-40 backdrop-blur-md bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                            Coming Soon
                          </h3>
                          <p className="text-gray-300 text-sm">
                            This model will be available soon!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Model Image */}
                    <div className="relative h-40">
                      <Image
                        src={`/ai-models/${model.id === 'neurolov-image' ? 'neuro-image-gen' :
                          model.id === 'text-to-video' || model.id === 'video' ? 'ai-video' :
                            model.id === 'music-ai' ? 'ai-music' :
                              'neuro-image-gen'}.png`}
                        alt={model.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <h3 className="text-2xl font-semibold text-white">{model.name}</h3>
                        <span className="text-sm text-gray-300">{model.type}</span>
                      </div>
                    </div>

                    {/* Model Details */}
                    <div className="p-4">
                      <p className="text-gray-300 text-sm mb-4">
                        {model.description}
                      </p>

                      {/* Features List */}
                      <ul className="space-y-2 mb-4">
                        {model.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#00FF94]" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <Button
                          onClick={() => handleAddToBag(model)}
                          disabled={!isDev && model.id !== 'neurolov-image'}
                          className={`inline-flex items-center gap-1 ${!isDev && model.id !== 'neurolov-image' ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#0066FF] hover:bg-[#0052CC]'} text-white px-4 py-2 rounded-full text-sm transition-colors`}
                        >
                          Launch App
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <button
                          onClick={(e) => handleLike(model.id, e)}
                          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          <Heart
                            className={`w-4 h-4 ${modelLikes[model.id]?.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                          />
                          <span>{modelLikes[model.id]?.count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                deployedContainers.map((container) => (
                  <div
                    key={container.id}
                    className="relative bg-[#141414] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* Model Image */}
                    <div className="relative h-40">
                      <Image
                        src={`/ai-models/${container.model_name === 'neurolov-image' ? 'neuro-image-gen' :
                          container.model_name === 'text-to-video' || container.model_name === 'video' ? 'ai-video' :
                            container.model_name === 'music-ai' ? 'ai-music' :
                              'neuro-image-gen'}.png`}
                        alt={container.model_name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <h3 className="text-2xl font-semibold text-white">{container.model_name}</h3>
                        <span className="text-sm text-gray-300">{container.model_type}</span>
                      </div>
                    </div>

                    {/* Model Details */}
                    <div className="p-4">
                      <p className="text-gray-300 text-sm mb-4">
                        {container.model_description}
                      </p>

                      {/* Features List */}
                      <ul className="space-y-2 mb-4">
                        {container.model_features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#00FF94]" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                        <Button
                          onClick={() => handleDeleteModel(container)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-1 text-sm"
                        >
                          Delete Model
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <button
                          onClick={(e) => handleLike(container.model_name, e)}
                          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          <Heart
                            className={`w-4 h-4 ${modelLikes[container.model_name]?.isLiked ? 'fill-red-500 text-red-500' : ''
                              }`}
                          />
                          <span>{modelLikes[container.model_name]?.count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
