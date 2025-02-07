'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ImageIcon, 
  Video, 
  Music, 
  MessageSquare, 
  Bot, 
  Box,
  Zap,
  Search,
  Filter,
  Info,
  Star,
  CheckCircle,
  Download,
  Send,
  Loader2,
  Share,
  Maximize2,
  X,
  Wand2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { styleOptions } from './options/style-options';
import { useModelBag } from '@/store/model-bag';
import { useUser } from '@/lib/hooks/useUser';
import ModelStatus from '@/app/gpulab/model-status';
import { StatusBadge } from '@/components/ui/status-badge';
import NeuroImageGenerator from '@/components/NeuroImageGenerator';

const models = [
  {
    id: 'flux-image',
    title: 'Neuro Image Gen',
    description: 'High-performance image generation and manipulation with support for multiple styles and formats',
    icon: <ImageIcon className="w-5 h-5" />,
    features: ['Text to Image', 'Image to Image', 'Inpainting', 'Style Transfer'],
    tags: ['Image', 'AI'],
    bgClass: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10',
    badgeClass: 'bg-blue-500/10 text-blue-400',
    status: 'success',
    statusText: 'Available',
    disabled: false
  },
  {
    id: 'video-gen',
    title: 'Video Generator',
    description: 'Create stunning videos from text descriptions or image sequences. Coming soon!',
    icon: <Video className="w-5 h-5" />,
    features: ['Text to Video', 'Image to Video', 'Video Editing', 'Animation'],
    tags: ['Video', 'AI'],
    bgClass: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
    badgeClass: 'bg-green-500/10 text-green-400',
    status: 'warning',
    statusText: 'Coming Soon',
    disabled: true
  },
  {
    id: 'music-gen',
    title: 'Music Generator',
    description: 'Generate original music and audio with AI assistance. Coming soon!',
    icon: <Music className="w-5 h-5" />,
    features: ['Text to Music', 'Music Continuation', 'Style Transfer', 'Sound Effects'],
    tags: ['Music', 'Audio', 'AI'],
    bgClass: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10',
    badgeClass: 'bg-yellow-500/10 text-yellow-400',
    status: 'warning',
    statusText: 'Coming Soon',
    disabled: true
  },
  {
    id: '3d-server',
    title: '3D Model Generator',
    description: 'Transform your 2D images into detailed 3D models using advanced AI. Coming soon!',
    icon: <Box className="w-5 h-5" />,
    features: ['3D model generation', 'Real-time rendering', 'Texture synthesis', 'Animation support'],
    tags: ['3D', 'Rendering'],
    bgClass: 'bg-gradient-to-br from-red-500/10 to-pink-500/10',
    badgeClass: 'bg-red-500/10 text-red-400',
    status: 'warning',
    statusText: 'Coming Soon',
    disabled: true
  }
];

const DEV_EMAILS = ['nitishmeswal@gmail.com', 'neohex262@gmail.com'];

function getModelIcon(type: string) {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-5 h-5" />;
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'audio':
      return <Music className="w-5 h-5" />;
    case 'chat':
      return <MessageSquare className="w-5 h-5" />;
    case 'deepfake':
      return <Bot className="w-5 h-5" />;
    case '3d':
      return <Box className="w-5 h-5" />;
    default:
      return <ImageIcon className="w-5 h-5" />;
  }
}

const IMAGE_SIZE = 1024;
const GUIDANCE_SCALES = [
  { value: 5, label: 'Fast (5)', description: 'Faster generation with less precise results' },
  { value: 10, label: 'Balanced (10)', description: 'Good balance between speed and quality' },
  { value: 20, label: 'Quality (20)', description: 'Higher quality with longer generation time' }
];
const DEFAULT_STYLES = [
  { id: 'realistic', name: 'Realistic', description: 'Photorealistic style' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'digital-art', name: 'Digital Art', description: 'Modern digital art style' },
  { id: 'oil-painting', name: 'Oil Painting', description: 'Classical oil painting style' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft watercolor style' },
  { id: '3d-render', name: '3D Render', description: 'Professional 3D rendering' },
];

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function AIModelsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [view, setView] = useState('explore');

  // Image Generation States
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [imageMode, setImageMode] = useState<'text2img' | 'img2img' | 'inpaint'>('text2img');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [safetyChecker, setSafetyChecker] = useState(true);
  const [enhanceStyle, setEnhanceStyle] = useState(DEFAULT_STYLES[0].id); 
  const [guidanceScale, setGuidanceScale] = useState(GUIDANCE_SCALES[1].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const MAX_GENERATIONS = 5;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Enhanced Image Generation States
  const [initImage, setInitImage] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [imageWidth, setImageWidth] = useState(512);
  const [imageHeight, setImageHeight] = useState(512);
  const [samples, setSamples] = useState(1);

  // Video Generation States
  const [videoMode, setVideoMode] = useState<'scene' | 'text' | 'image'>('text');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoNegativePrompt, setVideoNegativePrompt] = useState('');
  const [videoInitImage, setVideoInitImage] = useState<File | null>(null);
  const [videoHeight, setVideoHeight] = useState(512);
  const [videoWidth, setVideoWidth] = useState(512);
  const [videoNumFrames, setVideoNumFrames] = useState(16);
  const [videoInferenceSteps, setVideoInferenceSteps] = useState(20);
  const [videoGuidanceScale, setVideoGuidanceScale] = useState(7);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [scenes, setScenes] = useState<Array<{prompt: string, negative_prompt: string, duration: number}>>([
    { prompt: '', negative_prompt: '', duration: 3 }
  ]);
  const [videoCooldownTime, setVideoCooldownTime] = useState(0);

  // Scene management functions
  const addScene = () => {
    setScenes([...scenes, { prompt: '', negative_prompt: '', duration: 3 }]);
  };

  const updateScene = (index: number, field: keyof typeof scenes[0], value: string | number) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setScenes(newScenes);
  };

  const removeScene = (index: number) => {
    setScenes(scenes.filter((_, i) => i !== index));
  };

  // Video generation function
  const generateVideo = async () => {
    try {
      setIsGeneratingVideo(true);
      setVideoError(null);

      let endpoint = '';
      let payload: any = {
        height: videoHeight,
        width: videoWidth,
        output_type: 'mp4',
        temp: false
      };

      switch (videoMode) {
        case 'scene':
          endpoint = 'video/scene_creator';
          payload = {
            ...payload,
            scene: scenes
          };
          break;

        case 'text':
          endpoint = 'video/text2video';
          payload = {
            ...payload,
            model_id: 'ltx',
            prompt: videoPrompt,
            negative_prompt: videoNegativePrompt,
            num_frames: videoNumFrames,
            num_inference_steps: videoInferenceSteps,
            guidance_scale: videoGuidanceScale,
            upscale_height: 640,
            upscale_width: 1024,
            upscale_strength: 0.6,
            upscale_guidance_scale: 12,
            upscale_num_inference_steps: 20
          };
          break;

        case 'image':
          endpoint = 'video/img2video';
          if (!videoInitImage) {
            throw new Error('Please select an initial image');
          }

          // Convert image to base64
          const base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(videoInitImage);
          });

          payload = {
            ...payload,
            model_id: 'svd',
            init_image: base64Image,
            num_frames: videoNumFrames,
            num_inference_steps: videoInferenceSteps,
            min_guidance_scale: 1,
            max_guidance_scale: 3,
            motion_bucket_id: 127,
            noise_aug_strength: 0.02
          };
          break;
      }

      const response = await callModelLabsAPI(endpoint, payload);

      if (response.output?.[0]) {
        setGeneratedVideo(response.output[0]);
        // Add to generation history
        setGenerationHistory(prev => [{
          type: 'video',
          timestamp: new Date(),
          result: response.output[0]
        }, ...prev.slice(0, 9)]);
        
        toast.success('Video Generated Successfully');
      }
    } catch (err: any) {
      setVideoError(err.message || 'Failed to generate video');
      toast.error(err.message || 'Failed to generate video');
      throw err; // Re-throw for progress handling
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Progress simulation helper
  const simulateProgress = () => {
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    return () => clearInterval(interval);
  };

  // Generic progress wrapper for generation functions
  const generateWithProgress = async (
    generationFn: () => Promise<void>,
    type: 'image' | 'video' | 'audio' | 'music' | 'deepfake' | '3d'
  ) => {
    setGenerationProgress(0);
    const cleanup = simulateProgress();
    try {
      await generationFn();
      setGenerationProgress(100);
      // Add to history
      setGenerationHistory(prev => [{
        type,
        timestamp: new Date(),
        result: type === 'image' ? generatedImage :
          type === 'video' ? generatedVideo :
          type === 'audio' ? generatedAudio :
          type === 'music' ? generatedMusic :
          type === 'deepfake' ? generatedDeepfake :
          type === '3d' ? generated3dModel :
          type === 'interior' ? generatedInterior : null
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      setGenerationProgress(0);
    }
    cleanup();
  };

  // Audio Generation States
  const [audioPrompt, setAudioPrompt] = useState('');
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioGenerationCount, setAudioGenerationCount] = useState(0);
  const [audioCooldownTime, setAudioCooldownTime] = useState(0);
  const MAX_AUDIO_GENERATIONS = 5;

  // Music Generation States
  const [musicPrompt, setMusicPrompt] = useState('');
  const [initAudio, setInitAudio] = useState<string>('');
  const [samplingRate, setSamplingRate] = useState(32000);
  const [maxNewToken, setMaxNewToken] = useState(256);
  const [isMusicGenerating, setIsMusicGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [musicGenerationCount, setMusicGenerationCount] = useState(0);
  const [musicCooldownTime, setMusicCooldownTime] = useState(0);
  const MAX_MUSIC_GENERATIONS = 5;

  // Deepfake States
  const [deepfakeInitImage, setDeepfakeInitImage] = useState<string>('');
  const [deepfakeTargetImage, setDeepfakeTargetImage] = useState<string>('');
  const [deepfakeReferenceImage, setDeepfakeReferenceImage] = useState<string>('');
  const [isDeepfakeGenerating, setIsDeepfakeGenerating] = useState(false);
  const [generatedDeepfake, setGeneratedDeepfake] = useState<string | null>(null);
  const [deepfakeError, setDeepfakeError] = useState<string | null>(null);
  const [deepfakeGenerationCount, setDeepfakeGenerationCount] = useState(0);
  const [deepfakeCooldownTime, setDeepfakeCooldownTime] = useState(0);
  const MAX_DEEPFAKE_GENERATIONS = 5;

  // 3D Generation States
  const [text3dPrompt, setText3dPrompt] = useState('');
  const [text3dNegativePrompt, setText3dNegativePrompt] = useState('');
  const [text3dResolution, setText3dResolution] = useState(256);
  const [text3dOutputFormat, setText3dOutputFormat] = useState('glb');
  const [text3dRender, setText3dRender] = useState(false);
  const [isText3dGenerating, setIsText3dGenerating] = useState(false);
  const [generated3dModel, setGenerated3dModel] = useState<string | null>(null);
  const [text3dError, setText3dError] = useState<string | null>(null);
  const [text3dGenerationCount, setText3dGenerationCount] = useState(0);
  const [text3dCooldownTime, setText3dCooldownTime] = useState(0);
  const MAX_3D_GENERATIONS = 5;

  // Interior Architect States
  const [interiorPrompt, setInteriorPrompt] = useState('');
  const [interiorNegativePrompt, setInteriorNegativePrompt] = useState('bad quality');
  const [interiorInitImage, setInteriorInitImage] = useState<File | null>(null);
  const [interiorStrength, setInteriorStrength] = useState(0.99);
  const [interiorGuidanceScale, setInteriorGuidanceScale] = useState(8);
  const [interiorSteps, setInteriorSteps] = useState(51);
  const [generatedInterior, setGeneratedInterior] = useState<string | null>(null);
  const [isInteriorGenerating, setIsInteriorGenerating] = useState(false);
  const [interiorError, setInteriorError] = useState<string | null>(null);

  // Dialog states - Consolidate all demo states into one object
  interface DemoStates {
    'flux-image': boolean;
    'video-gen': boolean;
    'music-gen': boolean;
    '3d-server': boolean;
  }

  const [demoStates, setDemoStates] = useState<DemoStates>({
    'flux-image': false,
    'video-gen': false,
    'music-gen': false,
    '3d-server': false
  });

  const openDemo = (modelId: keyof DemoStates) => {
    setDemoStates(prev => ({
      ...prev,
      [modelId]: true
    }));
  };

  const closeDemo = (modelId: keyof DemoStates) => {
    setDemoStates(prev => ({
      ...prev,
      [modelId]: false
    }));
  };

  // Custom model states
  const [customModelUrl, setCustomModelUrl] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [customModelName, setCustomModelName] = useState('');
  const [customModelFormat, setCustomModelFormat] = useState<'diffusers' | 'safetensors' | 'ckpt'>('diffusers');
  const [customModelCategory, setCustomModelCategory] = useState<string>('stable_diffusion');
  const [customModelVisibility, setCustomModelVisibility] = useState<'private' | 'public'>('private');
  const [customModelImage, setCustomModelImage] = useState('');
  const [isCustomModelLoading, setIsCustomModelLoading] = useState(false);
  const [customModelError, setCustomModelError] = useState<string | null>(null);

  // Generation states
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);

  // UX enhancements and drag states
  const [showTooltip, setShowTooltip] = useState('');
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>([]);
  const [dragStates, setDragStates] = useState({
    image: false,
    video: false,
    deepfake: false,
    interior: false
  });

  const updateDragState = (type: keyof typeof dragStates, isDragging: boolean) => {
    setDragStates(prev => ({
      ...prev,
      [type]: isDragging
    }));
  };

  // File drag and drop handlers
  const handleDrag = (e: React.DragEvent, type: keyof typeof dragStates) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      updateDragState(type, true);
    } else if (e.type === "dragleave") {
      updateDragState(type, false);
    }
  };

  const handleDrop = async (e: React.DragEvent, type: keyof typeof dragStates) => {
    e.preventDefault();
    e.stopPropagation();
    updateDragState(type, false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    switch (type) {
      case 'image':
        if (imageMode === 'img2img') {
          setInitImage(files[0]);
        } else if (imageMode === 'inpaint') {
          setMaskImage(files[0]);
        }
        break;
      case 'video':
        setVideoInitImage(files[0]);
        break;
      case 'deepfake':
        // Handle deepfake image drop based on current context
        break;
      case 'interior':
        setInteriorInitImage(files[0]);
        break;
    }
  };

  const languages = [
    'english', 'arabic', 'spanish', 'brazilian portugues', 'german', 
    'czech', 'chinese', 'dutch', 'french', 'hindi', 'hungarian', 
    'italian', 'japanese', 'korean', 'polish', 'russian', 'turkish'
  ];

  const [deployedContainers, setDeployedContainers] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Chat States
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    {
      role: "system",
      content: "You are a helpful assistant."
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatGenerating, setIsChatGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatGenerationCount, setChatGenerationCount] = useState(0);
  const [chatCooldownTime, setChatCooldownTime] = useState(0);
  const MAX_CHAT_GENERATIONS = 10;

  // Generic function to call ModelLabs API
  const callModelLabsAPI = async (endpoint: string, data: any) => {
    try {
      const requestData = {
        prompt: data.prompt,
        negative_prompt: data.negative_prompt || "",
        width: data.width || 512,
        height: data.height || 512,
        samples: data.num_samples || 1,
        safety_checker: data.safety_checker !== false,
        instant_response: false,
        base64: false,
        guidance_scale: guidanceScale
      };

      console.log('Making request with data:', requestData);

      const response = await fetch('/api/modelslab/text2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_MODELSLAB_API_KEY || ''
        },
        body: JSON.stringify(requestData)
      });
    
      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok || responseData.error) {
        console.error('API Error:', responseData);
        throw new Error(responseData.error || 'Failed to generate image');
      }
    
      if (!responseData.output || !responseData.output.length) {
        console.error('No output in response:', responseData);
        throw new Error('No images returned from the API');
      }

      // Log the image URL for debugging
      const imageUrl = responseData.output[0];
      
      if (!imageUrl) {
        throw new Error('No image generated');
      }

      setGeneratedImage(imageUrl);
      saveToHistory(imageUrl);
      
    } catch (error) {
      console.error('Error calling ModelLabs API:', error);
      throw new Error(
        error.message || 
        'Failed to generate image. Please try again or check the console for details.'
      );
    }
  };

  // Fetch generation history
  const fetchHistory = async () => {
    try {
      const savedHistory = localStorage.getItem('generationHistory');
      if (savedHistory) {
        try {
          setGenerationHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('Error loading history:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load generation history',
        variant: 'destructive',
      });
    }
  };

  // Save generation to history
  const saveToHistory = (imageUrl: string) => {
    const newItem: GenerationHistoryItem = {
      id: Date.now().toString(),
      prompt,
      style: enhanceStyle,
      width: imageWidth,
      height: imageHeight,
      guidance: guidanceScale,
      imageUrl,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [newItem, ...generationHistory].slice(0, 50); // Keep last 50 items
    setGenerationHistory(updatedHistory);
    localStorage.setItem('generationHistory', JSON.stringify(updatedHistory));
  };

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const generateImage = async () => {
    if (!prompt) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt to generate an image',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);
    
    try {
      // Enhanced prompt with style
      const enhancedPrompt = enhancePrompt ? 
        `${prompt}, ${enhanceStyle} style, highly detailed, professional quality, masterpiece` :
        prompt;
      
      const response = await fetch('/api/modelslab/text2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_MODELSLAB_API_KEY || ''
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          width: imageWidth,
          height: imageHeight,
          guidance_scale: guidanceScale,
          num_inference_steps: 50,
          negative_prompt: negativePrompt || 'blurry, low quality, distorted, deformed, disfigured, bad anatomy, watermark',
          samples: samples
        }),
      });

      const data = await response.json();
      console.log('Generation response:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (!data.output?.[0]) {
        throw new Error('No image generated');
      }

      // Update the UI with the generated image
      setGeneratedImage(data.output[0]);
      saveToHistory(data.output[0]);

      toast({
        title: 'Success',
        description: 'Image generated successfully!',
      });
      
    } catch (error: any) {
      console.error('Error generating image:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Chat Generation
  const generateChatResponse = async () => {
    try {
      setIsChatGenerating(true);
      setChatError(null);

      // Add user message
      const updatedMessages = [
        ...messages,
        { role: "user", content: currentMessage }
      ];
      setMessages(updatedMessages);
      setCurrentMessage('');

      const response = await callModelLabsAPI('llm/uncensored_chat', {
        messages: updatedMessages,
        max_tokens: 1000
      });

      if (response.message) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: response.message }
        ]);
      }
    } catch (err: any) {
      setChatError(err.message || 'Failed to generate chat response');
    } finally {
      setIsChatGenerating(false);
    }
  };

  // Video Generation
  const generateVideoWithProgress = async () => {
    await generateWithProgress(generateVideo, 'video');
  };

  // Audio Generation
  const generateAudio = async () => {
    try {
      setIsAudioGenerating(true);
      setAudioError(null);

      const response = await callModelLabsAPI('audio/generate', {
        text: audioPrompt,
        voice_id: 'en-US-Neural2-F'
      });

      if (response.output) {
        setGeneratedAudio(response.output);
        setInferenceTime(response.inference_time);
      }
    } catch (err: any) {
      setAudioError(err.message || 'Failed to generate audio');
    } finally {
      setIsAudioGenerating(false);
    }
  };

  // Music Generation
  const generateMusic = async () => {
    try {
      setIsMusicGenerating(true);
      setMusicError(null);

      const response = await fetch('/api/modelslab/music-gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_MODELSLAB_API_KEY || ''
        },
        body: JSON.stringify({
          prompt: musicPrompt
        })
      });

      const data = await response.json();
      console.log('Music generation response:', data);

      if (!response.ok || data.error) {
        const errorMessage = data.error || data.details || 'Failed to generate music';
        throw new Error(errorMessage);
      }

      if (data.output && data.output[0]) {
        // Convert the audio data to a playable format
        const audioUrl = data.output[0];
        setGeneratedMusic(audioUrl);
        setInferenceTime(data.generationTime);
        toast({
          title: 'Success',
          description: 'Music generated successfully!',
        });
      } else {
        throw new Error('No audio data received');
      }
    } catch (err: any) {
      console.error('Error generating music:', err);
      const errorMessage = err.message || 'Failed to generate music';
      setMusicError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsMusicGenerating(false);
    }
  };

  // Deepfake Generation
  const generateDeepfake = async () => {
    try {
      setIsDeepfakeGenerating(true);
      setDeepfakeError(null);

      // Convert images to base64
      const initImageBase64 = await fileToBase64(deepfakeInitImage);
      const targetImageBase64 = await fileToBase64(deepfakeTargetImage);
      const referenceImageBase64 = await fileToBase64(deepfakeReferenceImage);

      const response = await callModelLabsAPI('deepfake/generate', {
        init_image: initImageBase64,
        target_image: targetImageBase64,
        reference_image: referenceImageBase64
      });

      if (response.output) {
        setGeneratedDeepfake(response.output);
        setInferenceTime(response.inference_time);
      }
    } catch (err: any) {
      setDeepfakeError(err.message || 'Failed to generate deepfake');
    } finally {
      setIsDeepfakeGenerating(false);
    }
  };

  // 3D Model Generation
  const generate3dModel = async () => {
    try {
      setIsText3dGenerating(true);
      setText3dError(null);

      const response = await callModelLabsAPI('3d/generate', {
        prompt: text3dPrompt,
        negative_prompt: text3dNegativePrompt,
        resolution: text3dResolution
      });

      if (response.output) {
        setGenerated3dModel(response.output);
        setInferenceTime(response.inference_time);
      }
    } catch (err: any) {
      setText3dError(err.message || 'Failed to generate 3D model');
    } finally {
      setIsText3dGenerating(false);
    }
  };

  // Interior Architect Generation
  const generateInterior = async () => {
    try {
      setIsInteriorGenerating(true);
      setInteriorError(null);

      // Convert image to base64
      const initImageBase64 = interiorInitImage ? await fileToBase64(interiorInitImage) : null;

      const response = await callModelLabsAPI('interior/make', {
        init_image: initImageBase64,
        prompt: interiorPrompt,
        negative_prompt: interiorNegativePrompt,
        strength: interiorStrength,
        guidance_scale: interiorGuidanceScale,
        num_inference_steps: interiorSteps,
        seed: 0,
        base64: false,
        temp: false,
        webhook: null,
        track_id: null
      });

      if (response.output) {
        setGeneratedInterior(response.output);
        setInferenceTime(response.inference_time);
      }
    } catch (err: any) {
      setInteriorError(err.message || 'Failed to generate interior design');
    } finally {
      setIsInteriorGenerating(false);
    }
  };

  // Custom model upload function
  const uploadCustomModel = async () => {
    try {
      setIsCustomModelLoading(true);
      setCustomModelError(null);

      const response = await callModelLabsAPI('model/load', {
        url: customModelUrl,
        model_id: customModelId,
        force_load: 'yes',
        revision: 'fp16',
        model_category: customModelCategory,
        model_format: customModelFormat,
        model_visibility: customModelVisibility,
        model_name: customModelName,
        model_image: customModelImage,
        hf_upload: 'no'
      });

      if (response.output) {
        // Handle successful upload
        toast.success('Custom model uploaded successfully');
        closeDemo('customModel');
      }
    } catch (err: any) {
      setCustomModelError(err.message || 'Failed to upload custom model');
    } finally {
      setIsCustomModelLoading(false);
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const filteredModels = models;

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
    let timer: NodeJS.Timeout;
    if (videoCooldownTime > 0) {
      timer = setInterval(() => {
        setVideoCooldownTime(time => Math.max(0, time - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [videoCooldownTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (audioCooldownTime > 0) {
      timer = setInterval(() => {
        setAudioCooldownTime(time => Math.max(0, time - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [audioCooldownTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (deepfakeCooldownTime > 0) {
      timer = setInterval(() => {
        setDeepfakeCooldownTime(time => Math.max(0, time - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [deepfakeCooldownTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (text3dCooldownTime > 0) {
      timer = setInterval(() => {
        setText3dCooldownTime(time => Math.max(0, time - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [text3dCooldownTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (musicCooldownTime > 0) {
      timer = setInterval(() => {
        setMusicCooldownTime(time => Math.max(0, time - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [musicCooldownTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (chatCooldownTime > 0) {
      timer = setInterval(() => {
        setChatCooldownTime(time => Math.max(0, time - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [chatCooldownTime]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Cooldown timer for video generation
    let timer: NodeJS.Timeout;
    if (videoCooldownTime > 0) {
      timer = setInterval(() => {
        setVideoCooldownTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [videoCooldownTime]);

  useEffect(() => {
    // Reset cooldown when video generation starts
    if (isGeneratingVideo) {
      setVideoCooldownTime(30); // 30 seconds cooldown
    }
  }, [isGeneratingVideo]);

  const handleDeleteModel = async (container: any) => {
    try {
      setIsDeleting(container.container_address);
      const client = GPULabClient.getInstance();
      await client.deleteContainer(container.container_address);
      toast.success('Model deleted successfully');
      // Refresh the list
      const containers = await client.getContainerList();
      setDeployedContainers(containers);
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model');
    } finally {
      setIsDeleting(null);
    }
  };

  // Function to handle demo button click
  const handleDemoClick = (modelId: string) => {
    console.log('Opening demo for model:', modelId);
    switch (modelId) {
      case 'flux-image':
        openDemo('flux-image');
        break;
      case 'video-gen':
        openDemo('video-gen');
        break;
      case 'audio-server':
        openDemo('audio-server');
        break;
      case 'music-gen':
        openDemo('music-gen');
        break;
      case 'uncensored-chat':
        openDemo('uncensored-chat');
        break;
      case 'deepfake':
        openDemo('deepfake');
        break;
      case '3d-server':
        openDemo('3d-server');
        break;
      case 'custom-model':
        openDemo('custom-model');
        break;
      case 'interior-architect':
        openDemo('interior-architect');
        break;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        Object.keys(demoStates).forEach(key => closeDemo(key as keyof typeof demoStates));
      }
      if (e.ctrlKey && e.key === 'Enter') {
        if (demoStates['flux-image']) generateImage();
        if (demoStates['video-gen']) generateVideoWithProgress();
        if (demoStates['audio-server']) generateAudio();
        if (demoStates['music-gen']) generateMusic();
        if (demoStates['deepfake']) generateDeepfake();
        if (demoStates['3d-server']) generate3dModel();
        if (demoStates['custom-model']) uploadCustomModel();
        if (demoStates['interior-architect']) generateInterior();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [demoStates]);

  const examplePrompts = {
    image: ["A serene landscape at sunset", "A futuristic cityscape", "An abstract art piece"],
    video: ["A flowing river in autumn", "Clouds moving across the sky", "Dancing particles"],
    audio: ["A warm, friendly greeting", "A professional announcement", "A dramatic narration"],
    music: ["Upbeat electronic dance music", "Calm meditation background", "Epic orchestral score"],
    deepfake: ["Use similar lighting and angle in both images", "Ensure faces are clearly visible", "Match the expressions"],
    "3d": ["A detailed spacecraft", "A fantasy character", "Modern furniture piece"],
    interior: ["A modern minimalist living room with wooden floors and large windows", "A cozy bedroom with a fireplace and a comfortable bed", "A futuristic kitchen with sleek appliances and a large island"]
  };

  const handleTryDemo = async (modelId: string) => {
    try {
      switch (modelId) {
        case 'flux-image':
          openDemo('flux-image');
          break;
        case 'uncensored-chat':
          openDemo('uncensored-chat');
          break;
        case 'video-gen':
          openDemo('video-gen');
          break;
        case 'music-gen':
          openDemo('music-gen');
          break;
        case 'deepfake':
          openDemo('deepfake');
          break;
        case '3d-server':
          openDemo('3d-server');
          break;
      }
    } catch (error) {
      console.error('Error opening demo:', error);
      toast.error('Failed to open demo. Please try again.');
    }
  };

  const handleImageDownload = async (imageUrl: string) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `neurolovai-${new Date().toISOString().split('T')[0]}.png`; // Format: neurolovai-YYYY-MM-DD.png
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Types for history
  type GenerationHistoryItem = {
    id: string;
    prompt: string;
    style: string;
    width: number;
    height: number;
    guidance: number;
    imageUrl: string;
    timestamp: string;
  };

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showFluxDialog, setShowFluxDialog] = useState(false);

  const handleModelClick = (model: typeof models[0]) => {
    if (model.disabled) {
      toast.info(`${model.title} is coming soon!`, {
        description: 'We will notify you when it launches.',
        duration: 3000,
      });
      return;
    }

    if (model.id === 'flux-image') {
      setShowFluxDialog(true);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {models.map((model) => (
          <div
            key={model.id}
            className="group relative transform hover:-translate-y-1 transition-all duration-300"
            style={{ minHeight: '320px' }}
          >
            <div className={cn(
              "absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500",
              model.disabled ? "bg-gradient-to-r from-gray-500/20 to-gray-600/20" : "bg-gradient-to-r from-[#40A6FF] to-[#2D63FF]"
            )}></div>
            <Card 
              className={cn(
                "relative h-full bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300",
                model.disabled && "opacity-75"
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      model.bgClass
                    )}>
                      {model.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-white">{model.title}</CardTitle>
                  </div>
                  <StatusBadge status={model.status}>{model.statusText}</StatusBadge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-6 h-12">{model.description}</p>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    {model.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-400"
                      >
                        <div className="w-1 h-1 rounded-full bg-gray-500"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {model.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium",
                          model.badgeClass
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-[#40A6FF] to-[#2D63FF] hover:from-[#2D63FF] hover:to-[#40A6FF] text-white"
                    disabled={model.disabled}
                    onClick={() => handleModelClick(model)}
                  >
                    {model.disabled ? 'Coming Soon' : 'Launch'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Flux Image Generator Dialog */}
      <Dialog open={showFluxDialog} onOpenChange={setShowFluxDialog}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-4 py-2 border-b border-white/5">
              <DialogTitle>Neuro Image Generator</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <NeuroImageGenerator />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Generation Dialog */}
      <Dialog open={demoStates['video-gen']} onOpenChange={() => closeDemo('video-gen')}>
        <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0 bg-[#1a1f2d] text-white">
          <div className="h-full flex flex-col md:flex-row">
            {/* Left Panel - Controls */}
            <div className="w-full md:w-1/3 p-6 space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-lg font-medium">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to create..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-32 resize-none bg-gray-900/50"
              />
              </div>

              {/* Style Selection */}
              <div className="space-y-2">
                <Label className="text-lg font-medium">Art Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_STYLES.map((style) => (
                    <Button
                      key={style.id}
                      variant={enhanceStyle === style.id ? "default" : "outline"}
                      className={`h-auto py-2 px-3 ${
                        enhanceStyle === style.id 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "hover:bg-gray-900/50"
                      }`}
                      onClick={() => setEnhanceStyle(style.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs text-gray-400">{style.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Guidance Scale Selection */}
              <div className="space-y-2">
                <Label>Guidance Scale</Label>
                <Select 
                  value={guidanceScale.toString()} 
                  onValueChange={(value) => setGuidanceScale(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select guidance scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {GUIDANCE_SCALES.map((scale) => (
                      <SelectItem 
                        key={scale.value} 
                        value={scale.value.toString()}
                      >
                        <div className="flex flex-col">
                          <span>{scale.label}</span>
                          <span className="text-xs text-muted-foreground">{scale.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateImage}
                disabled={isGenerating || !prompt}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {/* Generation History */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Generation History</h3>
                <div className="h-[calc(100vh-600px)] overflow-y-auto pr-4">
                  <div className="space-y-2">
                    {generationHistory.map((item) => (
                      <div
                        key={item.id}
                        className="group relative bg-gray-900/50 rounded-lg p-3 hover:bg-gray-900/70 transition-colors cursor-pointer"
                        onClick={() => setGeneratedImage(item.imageUrl)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-[60px] h-[60px]">
                            <Image
                              src={item.imageUrl}
                              alt={item.prompt}
                              fill
                              className="rounded-md object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">{item.prompt}</p>
                            <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-[#161b22]">
              <div className="h-full flex flex-col">
                <div className="flex-grow flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-400" />
                      <p className="text-gray-400">Creating your masterpiece...</p>
                      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : generatedImage ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full max-w-2xl"
                    >
                      <div className="relative aspect-square w-full">
                        <Image
                          src={generatedImage}
                          alt="Generated image"
                          fill
                          className="rounded-lg shadow-2xl object-contain"
                          unoptimized
                        />
                      </div>
                      
                      {/* Image Actions */}
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImageDownload(generatedImage)}
                          className="text-white hover:bg-white/20"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>

                      {/* Generation Details */}
                      <div className="mt-6 bg-gray-900/50 rounded-lg p-4 space-y-2">
                        <h4 className="font-medium">Generation Details</h4>
                        <div className="space-y-1 text-sm text-gray-400">
                          <p><span className="text-gray-500">Prompt:</span> {prompt}</p>
                          <p><span className="text-gray-500">Style:</span> {enhanceStyle}</p>
                          <p><span className="text-gray-500">Size:</span> {imageWidth}x{imageHeight}</p>
                          <p><span className="text-gray-500">Guidance Scale:</span> {guidanceScale}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center space-y-4">
                      <ImageIcon className="w-12 h-12 mx-auto text-gray-600" />
                      <p className="text-gray-400">Your generated image will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Generation Dialog */}
      <Dialog open={demoStates['video-gen']} onOpenChange={() => closeDemo('video-gen')}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Video Generator</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div
              onDragEnter={(e) => handleDrag(e, 'video')}
              onDragLeave={(e) => handleDrag(e, 'video')}
              onDragOver={(e) => handleDrag(e, 'video')}
              onDrop={(e) => handleDrop(e, 'video')}
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                dragStates.video ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
              }`}
            >
              {videoInitImage ? (
                <div className="relative aspect-video">
                  <Image
                    src={URL.createObjectURL(videoInitImage)}
                    alt="Initial video frame"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <p>Drag and drop your initial frame here</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Music Generation Dialog */}
      <Dialog open={demoStates['music-gen']} onOpenChange={(open) => !open && closeDemo('music-gen')}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-hidden p-0 bg-[#1a1f2d] text-white">
          <div className="h-full flex flex-col p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Music className="w-6 h-6" />
                Music Generator
              </DialogTitle>
              <DialogDescription>
                Generate music using AI with natural language prompts
              </DialogDescription>
            </DialogHeader>

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="musicPrompt" className="text-lg font-medium">Music Description</Label>
              <Textarea
                id="musicPrompt"
                placeholder="Describe the music you want to create (e.g., 'Upbeat electronic dance music with a strong bass line and melodic synths')"
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                className="h-32 resize-none bg-gray-900/50"
              />
            </div>

            {/* Example Prompts */}
            <div className="space-y-2">
              <Label className="text-lg font-medium">Example Prompts</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examplePrompts.music.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-2 px-3 hover:bg-gray-900/50 justify-start"
                    onClick={() => setMusicPrompt(example)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{example}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Generated Music Player */}
            {generatedMusic && (
              <div className="space-y-2">
                <Label className="text-lg font-medium">Generated Music</Label>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <audio controls className="w-full">
                    <source src={generatedMusic} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateMusic}
              disabled={isMusicGenerating || !musicPrompt}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700"
            >
              {isMusicGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Music...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Music
                </>
              )}
            </Button>

            {/* Error Display */}
            {musicError && (
              <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-lg">
                {musicError}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Deepfake Dialog */}
      <Dialog open={demoStates['deepfake']} onOpenChange={() => closeDemo('deepfake')}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Deepfake Studio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div
              onDragEnter={(e) => handleDrag(e, 'deepfake')}
              onDragLeave={(e) => handleDrag(e, 'deepfake')}
              onDragOver={(e) => handleDrag(e, 'deepfake')}
              onDrop={(e) => handleDrop(e, 'deepfake')}
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                dragStates.deepfake ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
              }`}
            >
              <p>Drag and drop your source image here</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interior Dialog */}
      <Dialog open={demoStates['interior-architect']} onOpenChange={() => closeDemo('interior-architect')}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Interior Architect</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div
              onDragEnter={(e) => handleDrag(e, 'interior')}
              onDragLeave={(e) => handleDrag(e, 'interior')}
              onDragOver={(e) => handleDrag(e, 'interior')}
              onDrop={(e) => handleDrop(e, 'interior')}
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                dragStates.interior ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
              }`}
            >
              {interiorInitImage ? (
                <div className="relative aspect-video">
                  <Image
                    src={URL.createObjectURL(interiorInitImage)}
                    alt="Interior reference"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <p>Drag and drop your interior reference image here</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
