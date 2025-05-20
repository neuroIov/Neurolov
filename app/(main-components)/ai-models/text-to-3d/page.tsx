'use client';
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import {
  Box,
  Loader2,
  ArrowLeft,
  PercentDiamond,
  Check,
  RefreshCw,
  Camera,
  Download,
  Settings,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as THREE from 'three';
import { getSupabaseClient } from '@/app/auth/supabase';
import { useUser } from '@/app/auth/useUser';
import UpgradePlanModal from '@/components/modals/UpgradePlanModal';

const ModelViewer = dynamic(() => import('../components/model-viewer'), { ssr: false });

class ModelErrorBoundary extends React.Component<
  { onError: (msg: string) => void; children: React.ReactNode },
  { hasError: boolean; error: any; retryCount: number }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }
  
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error loading model:', error, errorInfo);
    this.props.onError(error.message);
  }
  
  reset() {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      retryCount: prevState.retryCount + 1 
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-[#2c2c2c] text-white/50">
          <div className="text-center p-6 max-w-md">
            <div className="h-12 w-12 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-white font-medium mb-2">Failed to load 3D model</h3>
            <p className="text-white/70 text-sm mb-4">
              {this.state.retryCount > 1 
                ? "Try resizing your browser window or changing tabs to fix rendering issues."
                : "The model might need a moment to load properly."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => this.reset()}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Loading
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface GenerationOptions {
  resolution: number;
  output_format: string;
  render: boolean;
  negative_prompt: string;
  guidance_scale: number;
  num_inference_steps: number;
  ss_guidance_strength: number;
  ss_sampling_steps: number;
  slat_guidance_strength: number;
  slat_sampling_steps: number;
  mesh_simplify: number;
  foreground_ratio: number;
  remove_bg: boolean;
  chunk_size: number;
  seed: number;
}

const defaultOptions: GenerationOptions = {
  resolution: 256,
  output_format: 'glb',
  render: false,
  negative_prompt: '',
  guidance_scale: 1.0,
  num_inference_steps: 10,
  ss_guidance_strength: 7.5,
  ss_sampling_steps: 12,
  slat_guidance_strength: 3.0,
  slat_sampling_steps: 12,
  mesh_simplify: 0.9,
  foreground_ratio: 0.85,
  remove_bg: false,
  chunk_size: 8192,
  seed: 0,
};

const samplePrompts = [
  {
    prompt: 'Pumpkin-headed child, orange clothes',
    image: 'pumpkin head.png',
  },
  {
    prompt: 'Tiny, cute baby turtle, orange and metallic shell with lines',
    image: 'baby turtle.png',
  },
];

// Model Availability Indicator component
const ModelAvailabilityIndicator = ({ 
  isChecking, 
  wasChecked, 
  isAvailable,
  progressPhase
}: { 
  isChecking: boolean; 
  wasChecked: boolean; 
  isAvailable: boolean;
  progressPhase: 'aggressive' | 'regular' | 'complete' 
}) => {
  // Calculate progress width based on phase
  const getProgressWidth = () => {
    if (progressPhase === 'complete') return 100;
    if (progressPhase === 'aggressive') return 60;
    return 30; // regular
  };

  // Don't show anything if not checked and not checking
  if (!isChecking && !wasChecked) return null;

  return (
    <div className="flex flex-col space-y-2 mt-2">
      <div className="flex items-center space-x-2">
        {isChecking && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
        {wasChecked && isAvailable && <CheckCircle className="h-4 w-4 text-green-500" />}
        {wasChecked && !isAvailable && <Clock className="h-4 w-4 text-amber-500" />}
        <span className="text-sm">
          {isChecking ? "Checking availability..." : 
           wasChecked && isAvailable ? "Model is available!" : 
           wasChecked && !isAvailable ? "Model not ready yet" : ""}
        </span>
      </div>
      {(isChecking || (wasChecked && !isAvailable)) && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full ${
              progressPhase === 'aggressive' ? 'bg-blue-500' : 
              progressPhase === 'regular' ? 'bg-amber-500' : 'bg-green-500'
            } transition-all duration-500 ease-in-out`}
            style={{ width: `${getProgressWidth()}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default function TextTo3DPage() {
  const {user} = useUser()
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [options, setOptions] = useState<GenerationOptions>(defaultOptions);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [fetchUrl, setFetchUrl] = useState<string | null>(null);
  const [futureLinks, setFutureLinks] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentEta, setCurrentEta] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [activeToastId, setActiveToastId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<boolean | null>(null);
  const [pollingPhase, setPollingPhase] = useState<'aggressive' | 'regular' | 'complete'>('regular');
  const [modelKey, setModelKey] = useState(0);
  const [windowResized, setWindowResized] = useState(false);
  const [plan, setPlan] = useState("free")
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      const supabase = getSupabaseClient();

      if (!user) return;

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (userData && userData.plan) {
        setPlan(userData.plan);
      }
    };
    fetchPlan();
  }, [user]);

  // Add a ref for the result section for auto-scrolling
  const resultRef = useRef<HTMLDivElement>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const errorBoundaryRef = useRef<ModelErrorBoundary>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const futureLinksCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to result when generation completes
  useEffect(() => {
    if (generatedModelUrl && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedModelUrl]);

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (futureLinksCheckInterval.current) {
        clearInterval(futureLinksCheckInterval.current);
      }
    };
  }, []);

  // Effect to simulate progress during polling
  useEffect(() => {
    if (isPolling && currentEta) {
      setProgress(0);
      const interval = 100; // Update every 100ms
      const totalTime = currentEta * 1000; // Convert to milliseconds
      const incrementPerInterval = (interval / totalTime) * 100;
      
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + incrementPerInterval;
          return newProgress < 97 ? newProgress : 97; // Cap at 97% until complete
        });
      }, interval);
      
      return () => clearInterval(progressTimer);
    } else if (!isPolling && progress > 0) {
      // When polling ends, either complete to 100% or reset
      if (generatedModelUrl) {
        setProgress(100);
      } else {
        setProgress(0);
      }
    }
  }, [isPolling, currentEta, generatedModelUrl]);

  // Function to check model availability
  const checkModelAvailability = async (url: string): Promise<boolean> => {
    setCheckingAvailability(true);
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const isAvailable = response.status === 200;
      setLastCheckResult(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Error checking model availability:', error);
      setLastCheckResult(false);
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Function to attempt to load from future links
  const attemptLoadFromFutureLinks = async () => {
    if (futureLinks.length === 0) return false;
    
    // Try to load the first future link
    const link = futureLinks[0];
    const isAvailable = await checkModelAvailability(link);
    
    if (isAvailable) {
      setGeneratedModelUrl(link);
      setProgress(100);
      setIsGenerating(false);
      setIsPolling(false);
      clearAllIntervals();
      toast.success('3D model loaded successfully!');
      return true;
    }
    
    return false;
  };

  // Create intervals set and cleanup function
  const [intervalIds, setIntervalIds] = useState<NodeJS.Timeout[]>([]);
  
  const clearAllIntervals = () => {
    intervalIds.forEach(id => clearInterval(id));
    setIntervalIds([]);
  };

  // Enhanced polling that checks more frequently initially
  const startAggressivePolling = () => {
    // Clear any existing intervals
    clearAllIntervals();
    
    setPollingPhase('aggressive');
    
    // First check after a short delay (3 seconds)
    const initialTimeoutId = setTimeout(async () => {
      const success = await attemptLoadFromFutureLinks();
      if (success) {
        setPollingPhase('complete');
        return;
      }
      
      // If not successful, start aggressive polling
      // Check every 1.5 seconds for the first 15 seconds
      let checkCount = 0;
      const maxAggressiveChecks = 10; // 15 seconds total (10 checks * 1.5 seconds)
      
      const aggressiveIntervalId = setInterval(async () => {
        checkCount++;
        const success = await attemptLoadFromFutureLinks();
        
        if (success) {
          clearInterval(aggressiveIntervalId);
          setPollingPhase('complete');
        } else if (checkCount >= maxAggressiveChecks) {
          clearInterval(aggressiveIntervalId);
          
          // If we still haven't loaded after aggressive polling, fall back to regular polling
          if (isPolling) {
            setPollingPhase('regular');
            const regularIntervalId = setInterval(async () => {
              // Continue with regular 5-second polling
              if (await attemptLoadFromFutureLinks() || !isPolling) {
                clearInterval(regularIntervalId);
                if (isPolling) setPollingPhase('complete');
              }
            }, 5000);
            
            setIntervalIds(prev => [...prev, regularIntervalId]);
          }
        }
      }, 1500);
      
      setIntervalIds(prev => [...prev, aggressiveIntervalId]);
    }, 3000);
    
    setIntervalIds(prev => [...prev, initialTimeoutId]);
  };

  // Start enhanced polling when we have future links
  useEffect(() => {
    if (futureLinks.length > 0 && isPolling && !generatedModelUrl) {
      startAggressivePolling();
    }
    
    return () => {
      clearAllIntervals();
    };
  }, [futureLinks, isPolling, generatedModelUrl]);

  // Ensure we clean up intervals on unmount
  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, []);

  // Function to save prompt to Supabase
  const savePromptToSupabase = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No user session found, not saving prompt');
        return;
      }
      
      const userId = session.user.id;
      
      // Prepare content to save
      const content = JSON.stringify({
        prompt: prompt.trim(),
        resolution: options.resolution,
        output_format: options.output_format,
        render: options.render,
        negative_prompt: options.negative_prompt,
        guidance_scale: options.guidance_scale,
        num_inference_steps: options.num_inference_steps,
        ss_guidance_strength: options.ss_guidance_strength,
        ss_sampling_steps: options.ss_sampling_steps,
        slat_guidance_strength: options.slat_guidance_strength,
        slat_sampling_steps: options.slat_sampling_steps,
        mesh_simplify: options.mesh_simplify,
        foreground_ratio: options.foreground_ratio,
        remove_bg: options.remove_bg,
        chunk_size: options.chunk_size,
        seed: options.seed
      });
      
      // Call RPC function to insert text-to-3d message
      const { data, error } = await supabase.rpc('add_threed_gen_message', {
        p_user_id: userId,
        p_content: content
      });
      
      if (error) {
        console.error('Error saving 3D model prompt:', error);
      } else {
        console.log('3D model prompt saved successfully', data);
      }
    } catch (err) {
      console.error('Failed to save 3D model prompt:', err);
    }
  };

  // Update checkFutureLinks to save prompt when a future link becomes available
  const checkFutureLinks = async (links: string[]) => {
    if (!links || links.length === 0) return false;
    
    for (const link of links) {
      try {
        console.log("Checking link accessibility:", link);
        const isAvailable = await checkModelAvailability(link);
        if (isAvailable) {
          console.log("Link is accessible:", link);
          
          // Add a slight delay before setting the model URL to ensure rendering works correctly
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setGeneratedModelUrl(link);
          setProgress(100);
          
          toast.dismiss();
          toast.success('3D model generated successfully!');
          
          setIsGenerating(false);
          setIsPolling(false);
          clearAllIntervals();
          
          // Save the prompt to Supabase
          savePromptToSupabase();
          
          return true;
        } else {
          console.log("Link is not yet accessible:", link);
        }
      } catch (err) {
        console.error('Error checking future link:', err);
      }
    }
    
    return false;
  };

  // Update pollFetchResult to save prompt when fetch confirms model is ready
  const pollFetchResult = async (url: string) => {
    try {
      const response = await fetch(`/api/text-to-3d?fetchUrl=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check model status');
      }
      
      const data = await response.json();
      
      // If there's a modelUrl, check if it's available directly
      if (data.status === 'success' && data.modelUrl) {
        const isAvailable = await checkModelAvailability(data.modelUrl);
        if (isAvailable) {
          setGeneratedModelUrl(data.modelUrl);
          setInferenceTime(data.generationTime || 0);
          
          toast.dismiss();
          toast.success('3D model generated successfully!');
          
          setIsGenerating(false);
          setIsPolling(false);
          clearAllIntervals();
          
          // Save the prompt to Supabase
          savePromptToSupabase();
          
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.error('Error polling fetch result:', err);
      return false;
    }
  };

  const pollModelStatus = async (id: string, url: string, futureLinksList: string[], eta: number) => {
    setIsPolling(true);
    setCurrentEta(eta);
    setFetchUrl(url);
    setFutureLinks(futureLinksList);

    // Start continuous checking for future links
    if (futureLinksList && futureLinksList.length > 0) {
      console.log("Starting continuous checks for future links:", futureLinksList);
      
      // Show a "Model is being prepared" message immediately
      toast.dismiss();
      const modelPrepToast = toast.loading('Model is being prepared, it will appear shortly...');
      setActiveToastId(modelPrepToast);
      
      // Begin aggressive continuous checking (every 1 second)
      const checkInterval = setInterval(async () => {
        console.log("Running continuous link check");
        
        // First try the future links
        const linkSuccess = await checkFutureLinks(futureLinksList);
        if (linkSuccess) {
          clearInterval(checkInterval);
          return;
        }
        
        // If future links aren't working, try the fetch URL
        const fetchSuccess = await pollFetchResult(url);
        if (fetchSuccess) {
          clearInterval(checkInterval);
          return;
        }
        
      }, 1000); // Check every 1 second
      
      // Store the interval for cleanup
      futureLinksCheckInterval.current = checkInterval;
      
      // Set a timeout to stop polling after maximum time, but much longer now
      // Some models might take longer to become accessible
      const maxPollTime = eta * 1000 * 5; // 5x the estimated time
      setTimeout(() => {
        if (isPolling && !generatedModelUrl) {
          console.log("Maximum polling time reached");
          clearAllIntervals();
          setIsPolling(false);
          setIsGenerating(false);
          setError('Generation timeout. Try opening model link directly.');
          toast.dismiss();
          toast.error('Generation timed out. Try the direct download link.');
        }
      }, maxPollTime);
      
      return;
    }
    
    // Fallback to regular polling if no future links
    startRegularPolling(id, url, futureLinksList, eta);
  };
  
  const startRegularPolling = async (id: string, url: string, futureLinksList: string[], eta: number) => {
    // Initial delay before first poll
    const initialDelay = Math.min(2000, eta * 1000 * 0.1);
    await new Promise(resolve => setTimeout(resolve, initialDelay));
    
    // First try the fetch URL
    const fetchSuccess = await pollFetchResult(url);
    if (fetchSuccess) return;
    
    // If fetch URL didn't work, start polling both fetch URL and future links
    const pollInterval = 3000; // 3 seconds between polls
    
    // Check fetch URL periodically
    pollingInterval.current = setInterval(async () => {
      if (!isPolling) return;
      
      console.log('Polling fetch URL:', url);
      const success = await pollFetchResult(url);
      
      if (success) {
        clearAllIntervals();
      }
    }, pollInterval);
    
    // Check future links periodically
    futureLinksCheckInterval.current = setInterval(async () => {
      if (!isPolling) return;
      
      console.log('Checking future links:', futureLinksList);
      const success = await checkFutureLinks(futureLinksList);
      
      if (success) {
        clearAllIntervals();
      }
    }, pollInterval);
    
    // Set a timeout to stop polling after maximum time
    const maxPollTime = eta * 1000 * 3; // 3x the estimated time
    setTimeout(() => {
      if (isPolling) {
        clearAllIntervals();
        
        // If we still don't have a model, try one last check of future links
        if (!generatedModelUrl) {
          checkFutureLinks(futureLinksList).then(success => {
            if (!success) {
              setIsPolling(false);
              setIsGenerating(false);
              setError('Generation timeout. The model may still be processing.');
              toast.dismiss();
              toast.error('Generation timeout. Please try again later.');
            }
          });
        }
      }
    }, maxPollTime);
  };

  const handleGenerate = async () => {
    if (plan === 'free') {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.setState({ hasError: false, error: null });
    }

    setIsGenerating(true);
    setIsPolling(false);
    setError(null);
    setGeneratedModelUrl(null);
    setGenerationId(null);
    setFetchUrl(null);
    setFutureLinks([]);
    setProgress(0);
    setRetryCount(0);
    toast.dismiss();
    clearAllIntervals();

    try {
      const loadingToastId = toast.loading('Starting 3D model generation...');
      setActiveToastId(loadingToastId);
      
      const response = await fetch('/api/text-to-3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss(loadingToastId);
        setActiveToastId(null);
        throw new Error(data.error || 'Failed to generate 3D model');
      }

      // Handle processing state with fetch_result URL and future_links
      if (data.status === 'processing' && data.fetchUrl) {
        toast.dismiss(loadingToastId);
        const newToastId = toast.loading(`Generating your 3D model... Estimated time: ${data.eta || 30} seconds`);
        setActiveToastId(newToastId);
        
        setGenerationId(data.id);
        setFetchUrl(data.fetchUrl);
        setFutureLinks(data.futureLinks || []);
        
        pollModelStatus(
          data.id, 
          data.fetchUrl, 
          data.futureLinks || [], 
          data.eta || 30
        );
      } 
      // Handle immediate success
      else if (data.status === 'success' && data.modelUrl) {
        toast.dismiss(loadingToastId);
        setActiveToastId(null);
        
        // Verify the model is accessible
        const isAvailable = await checkModelAvailability(data.modelUrl);
        if (isAvailable) {
          setGeneratedModelUrl(data.modelUrl);
          setInferenceTime(data.generationTime);
          setProgress(100);
          toast.success('3D model generated successfully!');
          setIsGenerating(false);
          
          // Save the prompt to Supabase
          savePromptToSupabase();
        } else {
          throw new Error('Generated model is not accessible');
        }
      } else {
        toast.dismiss(loadingToastId);
        setActiveToastId(null);
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('3D generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsGenerating(false);
      setIsPolling(false);
      setProgress(0);
      setActiveToastId(null);
    }
  };

  const resetOptions = () => {
    setOptions(defaultOptions);
    toast.success('Settings reset to defaults');
  };

  const updateOption = (key: keyof GenerationOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const cancelGeneration = () => {
    clearAllIntervals();
    
    // Dismiss all active toast notifications
    toast.dismiss();
    setActiveToastId(null);
    
    setIsGenerating(false);
    setIsPolling(false);
    setProgress(0);
    toast.success('Generation cancelled');
  };

  // Function to manually check availability
  const handleCheckAvailability = async (url: string) => {
    const isAvailable = await checkModelAvailability(url);
    if (isAvailable) {
      setGeneratedModelUrl(url);
      toast.success('3D model loaded successfully!');
    } else {
      toast.error('The model is not ready yet. We\'ll keep checking automatically.');
    }
  };

  // Render link buttons with availability indicator
  const renderLinkButtons = (url: string, index: number) => (
    <div key={index} className="mt-2 flex flex-col">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Open Link
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={() => handleCheckAvailability(url)}
          disabled={checkingAvailability}
        >
          {checkingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Check Availability
        </Button>
      </div>
      <ModelAvailabilityIndicator 
        isChecking={checkingAvailability} 
        wasChecked={lastCheckResult !== null}
        isAvailable={!!lastCheckResult}
        progressPhase={pollingPhase}
      />
    </div>
  );

  // Add function to force model to reload
  const reloadModel = () => {
    if (errorBoundaryRef.current) {
      errorBoundaryRef.current.reset();
    }
    setModelKey(prev => prev + 1);
  };

  // Add an effect to detect window resizing and auto-reload the model if there's an error
  useEffect(() => {
    const handleResize = () => {
      setWindowResized(true);
      
      // If there's an error and we have a model URL, try reloading after resize
      if (error && generatedModelUrl) {
        // Add a small delay before reloading to ensure resize is complete
        setTimeout(() => {
          reloadModel();
          setError(null); // Clear the error since we're attempting a reload
        }, 500);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [error, generatedModelUrl]);

  return (
    <div ref={containerRef} className="min-h-screen w-full absolute top-[8.5%] left-0 right-0 transition-colors duration-300 bg-[#1c1c1c] overflow-y-auto pb-16">
      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        modelName="Text to 3D Model"
      />

      {/* Header - fixed z-index */}
      <div className="flex items-center px-4 py-3 sticky top-0 z-10 bg-[#1c1c1c] backdrop-blur-sm bg-opacity-80 mt-8 md:mt-1">
        <Link href="/ai-models" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all">
          <div className="rounded-full border border-white/20 p-1">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span className="text-sm md:text-base">All AI Models</span>
        </Link>
      </div>
      
      {/* Title section */}
      <div className="flex items-center justify-center mt-4 mb-6">
        <Box className="h-5 w-5 text-[#00FFBF] mr-2" />
        <h1 className="text-white font-medium text-xl">Text to 3D Model</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col-reverse md:flex-row gap-6 px-4 py-6 max-w-7xl mx-auto">
        {/* Left Section: Prompt Input and Sample Prompts */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Prompt Input */}
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Prompt</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Describe the 3D model you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                  <img src="/images/w.png" alt="" />
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                        onClick={() => setShowSettings(!showSettings)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Advanced Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <Textarea
                placeholder="Describe the 3D model you want to generate. Be specific about details, style, and features."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-32 bg-[#2c2c2c] border-white/10 text-white placeholder-white/50 resize-none"
                disabled={isGenerating}
              />
            </CardContent>
          </Card>

          {/* Advanced Settings Dialog */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent className="bg-[#1c1c1c] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-[#00FFBF] flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  Customize your 3D model generation parameters
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* Resolution */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Resolution</Label>
                    <span className="text-white/70 text-sm">{options.resolution}</span>
                  </div>
                  <Slider
                    min={128}
                    max={512}
                    step={128}
                    value={[options.resolution]}
                    onValueChange={(value) => updateOption('resolution', value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/50">
                    <span>128</span>
                    <span>512</span>
                  </div>
                </div>
                
                {/* Output Format */}
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select 
                    value={options.output_format}
                    onValueChange={(value) => updateOption('output_format', value)}
                  >
                    <SelectTrigger className="w-full bg-[#2c2c2c] border-white/10">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2c2c2c] border-white/10">
                      <SelectItem value="glb">GLB</SelectItem>
                      <SelectItem value="obj">OBJ</SelectItem>
                      <SelectItem value="stl">STL</SelectItem>
                      <SelectItem value="ply">PLY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Guidance Scale */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Guidance Scale</Label>
                    <span className="text-white/70 text-sm">{options.guidance_scale.toFixed(1)}</span>
                  </div>
                  <Slider
                    min={0.1}
                    max={10.0}
                    step={0.1}
                    value={[options.guidance_scale]}
                    onValueChange={(value) => updateOption('guidance_scale', value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/50">
                    <span>0.1</span>
                    <span>10.0</span>
                  </div>
                </div>
                
                {/* Inference Steps */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Inference Steps</Label>
                    <span className="text-white/70 text-sm">{options.num_inference_steps}</span>
                  </div>
                  <Slider
                    min={5}
                    max={50}
                    step={1}
                    value={[options.num_inference_steps]}
                    onValueChange={(value) => updateOption('num_inference_steps', value[0])}
                    className="w-full"
                  />
                </div>
                
                {/* Negative Prompt */}
                <div className="space-y-2">
                  <Label>Negative Prompt</Label>
                  <Textarea
                    placeholder="Elements to exclude from the model"
                    value={options.negative_prompt}
                    onChange={(e) => updateOption('negative_prompt', e.target.value)}
                    className="h-20 bg-[#2c2c2c] border-white/10 text-white placeholder-white/50 resize-none"
                  />
                </div>
                
                <Button onClick={resetOptions} variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sample Prompts */}
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Sample Prompts</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Click on a sample to use it as your prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {samplePrompts.map((sample, index) => (
                  <div
                    key={index}
                    className="bg-[#2c2c2c] border border-white/10 cursor-pointer hover:bg-[#3c3c3c] transition-all rounded-md overflow-hidden"
                    onClick={() => setPrompt(sample.prompt)}
                  >
                    <img
                      src={sample.image}
                      alt={sample.prompt}
                      className="w-full h-[120px] sm:h-[140px] object-cover"
                    />
                    <div className="p-3 pt-2">
                      <p className="text-white/90 text-xs font-medium">{sample.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          {isGenerating ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm text-white/70">
                <span>Generating 3D model...</span>
                {currentEta && <span>ETA: ~{currentEta} seconds</span>}
              </div>
              
              <div className="h-2 bg-[#2c2c2c] rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-[#00FFBF] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <Button
                onClick={cancelGeneration}
                className="w-full bg-red-900/50 hover:bg-red-900/80 text-white py-6 mt-4 border border-red-800/30"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Generation
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 mt-4"
            >
              <span className="flex flex-col md:flex-row md:items-center">
                <span className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Generate 3D Model</span>
                </span>
                <span className="ml-0 md:ml-2 font-extralight opacity-80 text-sm">
                  Estimated: {options.resolution > 256 ? "40" : "20"} sec
                </span>
              </span>
            </Button>
          )}
          
          {generatedModelUrl && !isGenerating && (
            <a
              href={generatedModelUrl}
              download={`3d-model.${options.output_format || 'glb'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden w-full inline-flex justify-center items-center gap-2 bg-[#2c2c2c] hover:bg-[#3c3c3c] text-white py-3 rounded-md transition-all border border-white/10 mt-2"
            >
              <Download className="h-4 w-4" />
              Download 3D Model
            </a>
          )}
          
          {inferenceTime && (
            <div className="text-center text-white/50 text-xs mt-2">
              Generation time: {inferenceTime.toFixed(2)} seconds
            </div>
          )}
        </div>

        {/* Right Section: 3D Model Viewer */}
        <div className="w-full md:w-2/3 flex flex-col">
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">3D Model Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={resultRef} className="h-[300px] md:h-[400px] lg:h-[500px] bg-[#2c2c2c] rounded-lg overflow-hidden border border-white/10 relative">
                {isGenerating && !generatedModelUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#2c2c2c] bg-opacity-80">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-t-[#00FFBF] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Box className="h-8 w-8 text-[#00FFBF]" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-white text-sm font-medium">Generating your 3D model</p>
                        <p className="text-white/50 text-xs">{progress.toFixed(0)}% complete</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && !isGenerating && !generatedModelUrl && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#2c2c2c]">
                    <div className="text-center p-6 max-w-md">
                      <div className="h-12 w-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-6 w-6 text-red-500" />
                      </div>
                      <h3 className="text-white font-medium mb-2">Generation Failed</h3>
                      <p className="text-white/70 text-sm mb-4">{error}</p>
                      <Button
                        onClick={handleGenerate}
                        className="bg-white/10 hover:bg-white/20 text-white"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
                
                <ModelErrorBoundary ref={errorBoundaryRef} onError={(msg) => setError(msg)}>
                  {generatedModelUrl ? (
                    <React.Suspense fallback={
                      <div className="h-full w-full flex items-center justify-center bg-[#2c2c2c] text-white/50">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" /> 
                        Loading model...
                      </div>
                    }>
                      <ModelViewer key={`model-viewer-${modelKey}`} src={generatedModelUrl} />
                    </React.Suspense>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#2c2c2c] text-white/30">
                      {!isGenerating && !error && (
                        <div className="text-center p-6 max-w-md">
                          <Box className="h-12 w-12 mx-auto mb-3 opacity-40" />
                          <h3 className="text-white/90 text-lg mb-2">Enter a prompt to generate a 3D model</h3>
                          <p className="text-white/50 text-sm">
                            Be specific about details, style, and features for better results.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </ModelErrorBoundary>
              </div>
            </CardContent>
            
            {generatedModelUrl && !isGenerating && (
              <CardFooter className="flex-col space-y-3">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-white/70 text-sm">Generation successful</span>
                  </div>
                  {inferenceTime && (
                    <span className="text-white/50 text-sm">Time: {inferenceTime.toFixed(2)}s</span>
                  )}
                </div>
                
                <div className="w-full">
                  <h3 className="text-white/90 text-sm font-medium mb-1">Generated Model URL</h3>
                  <p className="text-white/60 text-xs break-all">{generatedModelUrl}</p>
                </div>
                
                <div className="flex gap-3 w-full flex-col md:flex-row">
                  <Button
                    onClick={() => window.open(generatedModelUrl, '_blank')}
                    variant="outline"
                    className="hidden md:flex flex-1 items-center gap-2 bg-[#2c2c2c] border-white/10 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <a
                    href={generatedModelUrl}
                    download={`3d-model.${options.output_format || 'glb'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-md"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Model
                  </a>
                </div>
              </CardFooter>
            )}
          </Card>
          
          {isGenerating && futureLinks.length > 0 && (
            <Card className="bg-[#161A1E] border-white/10 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-[#00FFBF]">Direct Links</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Your 3D model is being prepared. You can use these links once available
                </CardDescription>
              </CardHeader>
              <CardContent>
                {futureLinks.map((link, index) => renderLinkButtons(link, index))}
              </CardContent>
            </Card>
          )}
          
          {!isGenerating && futureLinks.length > 0 && !generatedModelUrl && (
            <Card className="bg-[#161A1E] border-white/10 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-[#00FFBF]">Your 3D model should be ready</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {futureLinks.map((link, index) => renderLinkButtons(link, index))}
              </CardContent>
            </Card>
          )}
          
          {/* Add manual reload button when model is available but might have issues */}
          {generatedModelUrl && error && (
            <div className="absolute bottom-4 right-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={reloadModel}
                      size="sm"
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/20"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reload Model
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Having trouble viewing the model? Try reloading it.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}