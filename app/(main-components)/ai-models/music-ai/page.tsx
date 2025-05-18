// Music
'use client';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Music,
  Loader2,
  Upload,
  Play,
  Pause,
  Download,
  RefreshCw,
  AlertCircle,
  Check,
  Info,
  ExternalLink,
  Volume2,
  Volume1,
  VolumeX
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSupabaseClient } from '@/app/auth/supabase';
import { useUser } from '@/app/auth/useUser';
import UpgradePlanModal from '@/components/modals/UpgradePlanModal';

interface MusicOptions {
  base64: boolean;
  temp: boolean;
}

const defaultOptions: MusicOptions = {
  base64: false,
  temp: false,
};

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
}

// FileUpload Component
const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onChange,
  accept,
  placeholder,
  disabled = false,
  required = false,
  description
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real app, you would upload to your server/cloud storage
      // For example, using FormData:
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary URL for the file
      const fileUrl = URL.createObjectURL(file);
      onChange(fileUrl);
      
      toast.success(`${label} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`file-${label}`} className="text-white">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex space-x-2">
        <Input
          id={`file-${label}`}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isUploading}
          className="bg-[#2c2c2c] border-white/10 text-white placeholder-white/50"
        />
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#2c2c2c] border-white/10 text-white hover:bg-white/10"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

// AudioPlayer Component
const AudioPlayer: React.FC<{
  src: string | null;
  isGenerating: boolean;
}> = ({ src, isGenerating }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const prevVolumeRef = useRef(volume);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handlePlayStateChange = () => setIsPlaying(!audio.paused);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setAudioError("Could not play audio directly. Try 'Open in New Tab' option.");
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlayStateChange);
    audio.addEventListener('pause', handlePlayStateChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set CORS mode and type hints
    audio.crossOrigin = "anonymous";
    
    // Reset error state when src changes
    setAudioError(null);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlayStateChange);
      audio.removeEventListener('pause', handlePlayStateChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    if (audio.paused) {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setAudioError(err.message || "Could not play audio directly");
        toast.error('Failed to play audio. Try using the "Open in New Tab" option.');
      });
    } else {
      audio.pause();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setVolume(prevVolumeRef.current);
      audio.volume = prevVolumeRef.current;
      setIsMuted(false);
    } else {
      prevVolumeRef.current = volume;
      setVolume(0);
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleDownload = () => {
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = 'generated-music.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  return (
    <div className="w-full">
      {src && (
        <audio 
          ref={audioRef} 
          src={src} 
          preload="metadata"
        >
          <source src={src} type="audio/wav" />
          <source src={src} type="audio/mpeg" />
          <source src={src} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
      <div className="bg-[#2c2c2c] p-4 rounded-md border border-white/10">
        {audioError && (
          <div className="mb-3 p-2 bg-red-900/20 border border-red-900/30 rounded text-white/90 text-sm">
            <p>{audioError}</p>
            <p className="mt-1 text-xs text-white/70">Use the "Open in New Tab" button below to listen to your audio.</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={togglePlay}
              disabled={!src || isGenerating || !!audioError}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-none"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <div className="text-sm text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <div className="w-24">
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white"
              disabled={!src || isGenerating}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-blue-600 to-[#00FFBF]"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </div>
      </div>
    </div>
  );
};

export default function MusicAIPage() {
  const {user} = useUser()
  const [prompt, setPrompt] = useState('');
  const [initAudio, setInitAudio] = useState('');
  const [samplingRate, setSamplingRate] = useState(32000);
  const [maxNewToken, setMaxNewToken] = useState(512);
  const [options, setOptions] = useState<MusicOptions>(defaultOptions);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [outputAudio, setOutputAudio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [futureLinks, setFutureLinks] = useState<string[]>([]);
  const [fetchUrl, setFetchUrl] = useState<string | null>(null);
  const [currentEta, setCurrentEta] = useState<number | null>(null);
  const [plan, setPlan] = useState("free")
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      const supabase = getSupabaseClient()

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
  
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto scroll to result when output is available
  useEffect(() => {
    if (outputAudio && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputAudio]);

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
        prompt,
        init_audio: initAudio || null,
        sampling_rate: samplingRate,
        max_new_token: maxNewToken,
        base64: options.base64,
        temp: options.temp
      });
      
      // Call RPC function to insert music message
      const { data, error } = await supabase.rpc('add_music_gen_message', {
        p_user_id: userId,
        p_content: content
      });
      
      if (error) {
        console.error('Error saving music prompt:', error);
      } else {
        console.log('Music prompt saved successfully', data);
      }
    } catch (err) {
      console.error('Failed to save music prompt:', err);
    }
  };

  // Update the checkFutureLinks function to save prompt when generation is complete
  const checkFutureLinks = async (links: string[]) => {
    if (!links || links.length === 0) return false;
    
    for (const link of links) {
      try {
        console.log("Checking link accessibility:", link);
        const response = await fetch(link, { method: 'HEAD' });
        
        if (response.ok) {
          console.log("Link is accessible:", link);
          setOutputAudio(link);
          setProgress(100);
          
          toast.dismiss();
          toast.success('Music generated successfully!');
          
          setIsGenerating(false);
          setIsPolling(false);
          
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

  // Poll fetch URL to check for completion
  const pollFetchResult = async (url: string) => {
    try {
      const response = await fetch(`/api/music-ai/poll?fetchUrl=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check model status');
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.output && data.output.length > 0) {
        setOutputAudio(data.output[0]);
        setGenerationTime(data.generationTime || 0);
        
        toast.dismiss();
        toast.success('Music generated successfully!');
        
        setIsGenerating(false);
        setIsPolling(false);
        
        // Save the prompt to Supabase
        savePromptToSupabase();
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error polling fetch result:', err);
      return false;
    }
  };

  // Start polling future links and fetch URL
  const startPolling = (links: string[], url: string | null, eta: number) => {
    setIsPolling(true);
    setCurrentEta(eta);
    setFutureLinks(links);
    setFetchUrl(url);
    
    // Show a "Processing" message
    toast.dismiss();
    toast.loading('Music is being generated, it will be available shortly...');
    
    // Set up progress simulation
    const interval = 100; // Update every 100ms
    const totalTime = eta * 1000; // Convert to milliseconds
    const incrementPerInterval = (interval / totalTime) * 100;
    
    // Update progress bar
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + incrementPerInterval;
        return newProgress < 97 ? newProgress : 97; // Cap at 97% until complete
      });
    }, interval);
    
    // Check future links every 2 seconds
    const pollingInterval = setInterval(async () => {
      console.log("Checking music generation progress...");
      
      // First try future links
      const linkSuccess = await checkFutureLinks(links);
      if (linkSuccess) {
        clearInterval(pollingInterval);
        clearInterval(progressTimer);
        return;
      }
      
      // If future links aren't accessible yet, try the fetch URL
      if (url) {
        const fetchSuccess = await pollFetchResult(url);
        if (fetchSuccess) {
          clearInterval(pollingInterval);
          clearInterval(progressTimer);
          return;
        }
      }
    }, 2000);
    
    // Set a maximum polling time (3x the estimated time)
    setTimeout(() => {
      if (isPolling) {
        clearInterval(pollingInterval);
        clearInterval(progressTimer);
        
        if (!outputAudio) {
          setIsPolling(false);
          setIsGenerating(false);
          setError('Generation timed out. Try again or check the direct links below.');
          toast.dismiss();
          toast.error('Generation timed out.');
        }
      }
    }, eta * 1000 * 3);
  };

  // Handle form submission
  const handleGenerate = async () => {
    if (plan === 'free') {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!prompt) {
      toast.error('Prompt is required');
      return;
    }

    setIsGenerating(true);
    setIsPolling(false);
    setOutputAudio(null);
    setError(null);
    setProgress(0);
    setGenerationTime(null);
    setFutureLinks([]);
    setFetchUrl(null);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        return newProgress < 50 ? newProgress : 50;
      });
    }, 1000);

    try {
      const toastId = toast.loading('Generating music...');
      
      const response = await fetch('/api/music-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          init_audio: initAudio || undefined,
          sampling_rate: samplingRate,
          max_new_token: maxNewToken,
          base64: options.base64,
          temp: options.temp
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate music');
      }

      const data = await response.json();
      
      // Handle immediate success
      if (data.status === 'success' && data.output && data.output.length > 0) {
        setOutputAudio(data.output[0]);
        setGenerationTime(data.generationTime);
        setProgress(100);
        toast.dismiss(toastId);
        toast.success('Music generated successfully!');
        setIsGenerating(false);
        
        // Save the prompt to Supabase
        savePromptToSupabase();
      } 
      // Handle processing status with polling
      else if (data.status === 'processing' && data.futureLinks) {
        toast.dismiss(toastId);
        
        startPolling(
          data.futureLinks || [], 
          data.fetchUrl, 
          data.eta || 30
        );
      } 
      else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Music generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to generate music');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setInitAudio('');
    setOutputAudio(null);
    setError(null);
    setOptions(defaultOptions);
    setSamplingRate(32000);
    setMaxNewToken(512);
    setProgress(0);
    setGenerationTime(null);
    toast.success('Form reset successfully');
  };

  return (
    <div className="min-h-screen w-full absolute top-[8.5%] left-0 right-0 transition-colors duration-300 bg-[#1c1c1c] overflow-y-auto pb-16">
      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        modelName="Music AI Generator"
      />

      {/* Header - reduced z-index */}
      <div className="flex items-center px-4 py-3 sticky top-0 z-10 bg-[#1c1c1c] backdrop-blur-sm bg-opacity-80 mt-8 md:mt-1">
        <Link href="/ai-models" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all">
            <div className="rounded-full border border-white/20 p-1">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          <span className="text-sm md:text-base">All AI Models</span>
          </Link>
        <div className="w-24">
          {/* Spacer for balanced layout */}
        </div>
      </div>
      
      {/* Title moved outside header */}
      <div className="flex items-center justify-center mt-4 mb-6">
        <Music className="h-5 w-5 text-[#00FFBF] mr-2" />
        <h1 className="text-white font-medium text-xl">Music AI Generator</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Input Options */}
        <div className="space-y-6">
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Music Generation</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Describe the music you want to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white flex items-center justify-between">
                  <span>Prompt <span className="text-red-500">*</span></span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Describe the music you want to generate (style, instruments, mood, tempo, etc.)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. marimba, percussion, bass, tropical house, melodic riff, G# minor, 96 bpm"
                  disabled={isGenerating}
                  className="min-h-[100px] bg-[#2c2c2c] border-white/10 text-white placeholder-white/50"
                />
              </div>

              {/* Initial Audio (optional) */}
              <FileUpload
                label="Initial Audio (Optional)"
                value={initAudio}
                onChange={setInitAudio}
                accept="audio/*"
                placeholder="Enter URL or upload conditioning melody (up to 30 seconds)"
                disabled={isGenerating}
                description="Conditioning melody for music generation (up to 30 seconds)"
              />

              {/* Sampling Rate Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sampling-rate" className="text-white">Sampling Rate</Label>
                  <span className="text-sm text-white/70">{samplingRate} Hz</span>
                </div>
                <div className={isGenerating ? "opacity-50 pointer-events-none" : ""}>
                  <Slider
                    value={[samplingRate]}
                    min={10000}
                    max={48000}
                    step={1000}
                    onValueChange={(value) => setSamplingRate(value[0])}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-white/50">Higher values provide better audio quality (Default: 32000)</p>
              </div>

              {/* Max New Token Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-token" className="text-white">Max New Token</Label>
                  <span className="text-sm text-white/70">{maxNewToken}</span>
                </div>
                <div className={isGenerating ? "opacity-50 pointer-events-none" : ""}>
                  <Slider
                    value={[maxNewToken]}
                    min={256}
                    max={1024}
                    step={8}
                    onValueChange={(value) => setMaxNewToken(value[0])}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-white/50">Controls the length of the generated music (Range: 256-1024)</p>
              </div>
            </CardContent>
          </Card>

          {/* Options Card */}
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="base64" className="text-white">Base64 Format</Label>
                  <p className="text-sm text-white/50">Input audio is in base64 format</p>
                </div>
                <Switch
                  id="base64"
                  checked={options.base64}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, base64: checked }))}
                  disabled={isGenerating}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="temp" className="text-white">Use Temporary Links</Label>
                  <p className="text-sm text-white/50">For regions blocking storage site access</p>
                </div>
                <Switch
                  id="temp"
                  checked={options.temp}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, temp: checked }))}
                  disabled={isGenerating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="space-y-4">
            {isGenerating ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm text-white/70">
                  <span>Generating music...</span>
                  {currentEta && <span>ETA: ~{currentEta}s</span>}
                </div>
                
                <div className="h-2 bg-[#2c2c2c] rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-[#00FFBF] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <Button
                  onClick={() => {
                    setIsGenerating(false);
                    setIsPolling(false);
                    setProgress(0);
                    toast.dismiss();
                    toast.error('Generation cancelled');
                  }}
                  className="w-full bg-red-900/50 hover:bg-red-900/80 text-white py-6 border border-red-800/30"
                >
                  Cancel Generation
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt || isGenerating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Music className="mr-2 h-4 w-4" />
                  )}
                  Generate Music
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  disabled={isGenerating}
                  className="bg-[#2c2c2c] border-white/10 text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                            </div>
                          )}
                        </div>
        </div>

        {/* Right Column - Preview & Result */}
        <div className="space-y-6">
          {/* Output Result - added ref for auto scroll */}
          <div ref={outputRef}>
            <Card className="bg-[#161A1E] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-[#00FFBF]">Generated Music</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative bg-[#2c2c2c] rounded-md overflow-hidden border border-white/10 min-h-[200px] flex items-center justify-center">
                  {isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#2c2c2c]/80">
                      <Loader2 className="h-12 w-12 text-[#00FFBF] animate-spin mb-4" />
                      <div className="text-center space-y-1">
                        <p className="text-white text-sm font-medium">Generating music</p>
                        <p className="text-white/50 text-xs">{progress.toFixed(0)}% complete</p>
                      </div>
                          </div>
                  )}
                  
                  {error && !isGenerating && (
                    <div className="text-center p-6">
                      <div className="h-12 w-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      </div>
                      <h3 className="text-white font-medium mb-2">Generation Failed</h3>
                      <p className="text-white/70 text-sm mb-4">{error}</p>
                    </div>
                  )}
                  
                  {outputAudio && !isGenerating && !error ? (
                    <div className="p-4 w-full">
                      <AudioPlayer 
                        src={outputAudio}
                        isGenerating={isGenerating}
                      />
                    </div>
                  ) : !isGenerating && !error ? (
                    <div className="text-center p-6">
                      <Music className="h-12 w-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50">Generated music will appear here</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
              {outputAudio && !isGenerating && (
                <CardFooter className="flex-col space-y-3">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-white/70 text-sm">Generation successful</span>
                    </div>
                    {generationTime && (
                      <span className="text-white/50 text-sm">Time: {generationTime.toFixed(2)}s</span>
                    )}
                  </div>
                  <Button
                    onClick={() => window.open(outputAudio, '_blank')}
                    variant="outline"
                    className="hidden md:flex w-full items-center justify-center gap-2 bg-[#2c2c2c] border-white/10 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </Button>
                </CardFooter>
              )}
            </Card>
                      </div>

          {!outputAudio && futureLinks.length > 0 && (
            <Card className="bg-[#161A1E] border-white/10 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-[#00FFBF]">Direct Links</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  If the audio is taking too long to load, try these direct links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {futureLinks.map((link, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 bg-[#2c2c2c] rounded-md">
                      <span className="text-white/70 text-xs truncate flex-1">{link}</span>
                      <Button
                        onClick={() => window.open(link, '_blank')}
                        variant="outline"
                        size="sm"
                        className="bg-[#2c2c2c] border-white/10 text-white hover:bg-white/10"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </Button>
                    </div>
                  ))}
                        </div>
                </CardContent>
              </Card>
          )}

          {/* Example Prompts */}
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Example Prompts</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Try these prompts to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "Piano, ambient, calm atmosphere, C major, 60 bpm",
                  "Electronic drums, bass, synth lead, cyberpunk, D minor, 128 bpm",
                  "Acoustic guitar, folk melody, warm tones, G major, 90 bpm",
                  "Orchestra, epic cinematic score, brass section, dramatic, B minor, 110 bpm",
                  "Jazz trio, piano, double bass, drums, swing rhythm, Eb major, 120 bpm"
                ].map((examplePrompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => setPrompt(examplePrompt)}
                    disabled={isGenerating}
                    className="w-full justify-start bg-[#2c2c2c] border-white/10 text-white hover:bg-white/20 mb-2"
                  >
                    <span className="truncate">{examplePrompt}</span>
                  </Button>
                ))}
                  </div>
                </CardContent>
              </Card>
        </div>
      </div>
    </div>
  );
}