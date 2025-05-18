'use client';
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import {
  Loader2,
  ArrowLeft,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Download,
  AlertCircle,
  Check,
  X,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSupabaseClient } from '@/app/auth/supabase';
import { useUser } from '@/app/auth/useUser';
import UpgradePlanModal from '@/components/modals/UpgradePlanModal';

interface DeepfakeOptions {
  watermark: boolean;
}

const defaultOptions: DeepfakeOptions = {
  watermark: true,
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

// ImagePreview Component
const ImagePreview: React.FC<{
  src: string | null;
  label: string;
  className?: string;
}> = ({ src, label, className = "" }) => {
  if (!src) return null;

  return (
    <div className={`relative rounded-md overflow-hidden border border-white/10 ${className}`}>
      <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded-md text-xs text-white">
        {label}
      </div>
      <img 
        src={src} 
        alt={label} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default function DeepfakePage() {
  const [initImage, setInitImage] = useState('');
  const [targetImage, setTargetImage] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<DeepfakeOptions>(defaultOptions);
  const [progress, setProgress] = useState(0);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [futureLinks, setFutureLinks] = useState<string[]>([]);
  const [fetchUrl, setFetchUrl] = useState<string | null>(null);
  const [currentEta, setCurrentEta] = useState<number | null>(null);
  const [plan, setPlan] = useState("free")
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { user } = useUser()
  
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
  
  // Auto scroll to result when output image is available
  useEffect(() => {
    if (outputImage && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputImage]);

  // Poll for future links to check if they're accessible
  const checkFutureLinks = async (links: string[]) => {
   

    if (!links || links.length === 0) return false;
    
    for (const link of links) {
      try {
        console.log("Checking link accessibility:", link);
        const response = await fetch(link, { method: 'HEAD' });
        
        if (response.ok) {
          console.log("Link is accessible:", link);
          setOutputImage(link);
          setProgress(100);
          
          toast.dismiss();
          toast.success('Deepfake generated successfully!');
          
          setIsGenerating(false);
          setIsPolling(false);
          
          // Save the prompt to Supabase when generation completes
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
      const response = await fetch(`/api/deepfake/poll?fetchUrl=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check model status');
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.output && data.output.length > 0) {
        setOutputImage(data.output[0]);
        setGenerationTime(data.generationTime || 0);
        
        toast.dismiss();
        toast.success('Deepfake generated successfully!');
        
        setIsGenerating(false);
        setIsPolling(false);
        
        // Save the prompt to Supabase when generation completes
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
  const startPolling = (links: string[], url: string, eta: number) => {
    setIsPolling(true);
    setCurrentEta(eta);
    setFutureLinks(links);
    setFetchUrl(url);
    
    // Show a "Processing" message
    toast.dismiss();
    toast.loading('Deepfake is being prepared, it will appear shortly...');
    
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
      console.log("Checking future links...");
      
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
        
        if (!outputImage) {
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

    if (!initImage) {
      toast.error('Initial image is required');
      return;
    }
    if (!targetImage) {
      toast.error('Target image is required');
      return;
    }

    setIsGenerating(true);
    setIsPolling(false);
    setOutputImage(null);
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
      const toastId = toast.loading('Generating deepfake image...');
      
      const response = await fetch('/api/deepfake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          init_image: initImage,
          target_image: targetImage,
          reference_image: referenceImage || null,
          watermark: options.watermark
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate deepfake');
      }

      const data = await response.json();
      
      // Handle immediate success
      if (data.status === 'success' && data.output && data.output.length > 0) {
        setOutputImage(data.output[0]);
        setGenerationTime(data.generationTime);
        setProgress(100);
        toast.dismiss(toastId);
        toast.success('Deepfake generated successfully!');
        setIsGenerating(false);
        
        // Save the prompt to Supabase
        savePromptToSupabase();
      } 
      // Handle processing status with polling
      else if (data.status === 'processing' && data.fetchUrl) {
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
      console.error('Deepfake generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to generate deepfake');
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

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
        init_image: initImage,
        target_image: targetImage,
        reference_image: referenceImage || null,
        watermark: options.watermark
      });
      
      // Call RPC function to insert deepfake message
      const { data, error } = await supabase.rpc('add_deepfake_gen_message', {
        p_user_id: userId,
        p_content: content
      });
      
      if (error) {
        console.error('Error saving deepfake prompt:', error);
      } else {
        console.log('Deepfake prompt saved successfully', data);
      }
    } catch (err) {
      console.error('Failed to save deepfake prompt:', err);
    }
  };

  const resetForm = () => {
    setInitImage('');
    setTargetImage('');
    setReferenceImage('');
    setOutputImage(null);
    setError(null);
    setOptions(defaultOptions);
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
        modelName="Deepfake Face Swap"
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
        <ImageIcon className="h-5 w-5 text-[#00FFBF] mr-2" />
        <h1 className="text-white font-medium text-xl">Deepfake Face Swap</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Input Options */}
        <div className="space-y-6">
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Input Images</span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Provide the images for face swapping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Initial Image */}
              <FileUpload
                label="Initial Image"
                value={initImage}
                onChange={setInitImage}
                accept="image/*"
                placeholder="Enter URL or upload image containing the face to replace"
                disabled={isGenerating}
                required
                description="The image containing the face you want to replace"
              />

              {/* Target Image */}
              <FileUpload
                label="Target Image"
                value={targetImage}
                onChange={setTargetImage}
                accept="image/*"
                placeholder="Enter URL or upload image containing the face to be swapped"
                disabled={isGenerating}
                required
                description="The image containing the face you want to use as replacement"
              />

              {/* Reference Image (Optional) */}
              <FileUpload
                label="Reference Image (Optional)"
                value={referenceImage}
                onChange={setReferenceImage}
                accept="image/*"
                placeholder="Enter URL or upload specific reference face image"
                disabled={isGenerating}
                description="A reference image containing the specific face to swap from the initial image"
              />
            </CardContent>
          </Card>

          {/* Options Card */}
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="watermark" className="text-white">Add Watermark</Label>
                  <p className="text-sm text-white/50">Include a watermark on the generated image</p>
                </div>
                <Switch
                  id="watermark"
                  checked={options.watermark}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, watermark: checked }))}
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
                  <span>Generating deepfake...</span>
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
                    setProgress(0);
                    toast.dismiss();
                    toast.error('Generation cancelled');
                  }}
                  className="w-full bg-red-900/50 hover:bg-red-900/80 text-white py-6 border border-red-800/30"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Generation
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!initImage || !targetImage || isGenerating}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="mr-2 h-4 w-4" />
                  )}
                  Generate Deepfake
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
          {/* Preview Images */}
          <Card className="bg-[#161A1E] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="text-[#00FFBF]">Image Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Init Image Preview */}
                {initImage ? (
                  <ImagePreview src={initImage} label="Initial Image" className="h-40" />
                ) : (
                  <div className="h-40 bg-[#2c2c2c] rounded-md flex items-center justify-center text-white/30 border border-white/10">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">Initial Image</span>
                    </div>
                  </div>
                )}

                {/* Target Image Preview */}
                {targetImage ? (
                  <ImagePreview src={targetImage} label="Target Image" className="h-40" />
                ) : (
                  <div className="h-40 bg-[#2c2c2c] rounded-md flex items-center justify-center text-white/30 border border-white/10">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <span className="text-xs">Target Image</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Image Preview (if available) */}
              {referenceImage && (
                <div className="mt-4">
                  <ImagePreview src={referenceImage} label="Reference Image" className="h-40" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Result - added ref for auto scroll */}
          <div ref={outputRef}>
            <Card className="bg-[#161A1E] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-[#00FFBF]">Output Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-[#2c2c2c] rounded-md overflow-hidden border border-white/10 min-h-[300px] flex items-center justify-center">
                  {isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#2c2c2c]/80">
                      <Loader2 className="h-12 w-12 text-[#00FFBF] animate-spin mb-4" />
                      <div className="text-center space-y-1">
                        <p className="text-white text-sm font-medium">Generating deepfake</p>
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
                  
                  {outputImage && !isGenerating && !error ? (
                    <img 
                      src={outputImage} 
                      alt="Generated Deepfake" 
                      className="w-full h-full object-contain"
                    />
                  ) : !isGenerating && !error ? (
                    <div className="text-center p-6">
                      <ImageIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/50">Generated image will appear here</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
              {outputImage && !isGenerating && (
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
                  <div className="flex gap-3 w-full md:flex-row flex-col">
                    <Button
                      onClick={() => window.open(outputImage, '_blank')}
                      variant="outline"
                      className="hidden md:flex flex-1 items-center gap-2 bg-[#2c2c2c] border-white/10 text-white hover:bg-white/10"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in New Tab
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = outputImage;
                        link.download = 'deepfake-result.jpg';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Result
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>

          {!outputImage && futureLinks.length > 0 && (
            <Card className="bg-[#161A1E] border-white/10 mt-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-[#00FFBF]">Direct Links</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  If the image is taking too long to load, try these direct links
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
        </div>
      </div>
    </div>
  );
}