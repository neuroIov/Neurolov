import type { AIModel } from '@/store/model-bag';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  tags: string[];
  iconBg: string;
  features: string[];
  defaultConfig: {
    containerImage: string;
    exposedPorts: number[];
    minDisk: number;
    minVram: number;
  };
  comingSoon?: boolean;
}

export const models: AIModel[] = [
  {
    id: 'flux-image',
    name: 'Flux Image Gen',
    description: 'High-performance image generation and manipulation with support for multiple styles and formats',
    type: 'image',
    tags: ['Image Generation', 'Fast'],
    iconBg: 'bg-blue-500/10',
    features: [
      'Multiple style support',
      'Real-time image manipulation',
      'Batch processing',
      'Custom style training'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/flux-gpulab:latest',
      exposedPorts: [8080, 3754],
      minDisk: 10,
      minVram: 24
    }
  },
  {
    id: 'uncensored-chat',
    name: 'Uncensored Chat',
    description: 'Advanced chat model with unrestricted responses and flexible conversation capabilities',
    type: 'chat',
    tags: ['Chat', 'Unrestricted', 'AI'],
    iconBg: 'bg-yellow-500/10',
    features: [
      'Unrestricted conversations',
      'Context-aware responses',
      'Multi-turn chat support',
      'High token limit'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/chat-gpulab:latest',
      exposedPorts: [8000],
      minDisk: 5,
      minVram: 8
    }
  },
  {
    id: 'super-agents',
    name: 'AI Super Agents',
    description: 'Advanced AI agents for task automation and decision making',
    type: 'agent',
    tags: ['AI', 'Automation'],
    iconBg: 'bg-purple-500/10',
    features: [
      'Task automation',
      'Decision making',
      'Multi-agent coordination',
      'Custom agent training'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/agents-gpulab:latest',
      exposedPorts: [8888],
      minDisk: 15,
      minVram: 16
    },
    comingSoon: true
  },
  {
    id: 'video-gen',
    name: 'Video Generator',
    description: 'AI-powered video generation and editing with real-time processing',
    type: 'video',
    tags: ['Video', 'Generation'],
    iconBg: 'bg-red-500/10',
    features: [
      'Real-time video generation',
      'Style transfer',
      'Video editing',
      'Custom effects'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/video-gpulab:latest',
      exposedPorts: [8080, 50051],
      minDisk: 20,
      minVram: 32
    }
  },
  {
    id: 'llm-server',
    name: 'LLM Server',
    description: 'Large Language Model server for text generation and analysis',
    type: 'text',
    tags: ['LLM', 'Text'],
    iconBg: 'bg-green-500/10',
    features: [
      'Text generation',
      'Language analysis',
      'Custom model training',
      'API integration'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/llm-gpulab:latest',
      exposedPorts: [8000, 8080],
      minDisk: 30,
      minVram: 24
    },
    comingSoon: true
  },
  {
    id: 'music-gen',
    name: 'Music Generator',
    description: 'AI-powered music generation and audio processing',
    type: 'audio',
    tags: ['Music', 'Audio'],
    iconBg: 'bg-pink-500/10',
    features: [
      'Music generation',
      'Audio processing',
      'Style transfer',
      'Custom training'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/music-gpulab:latest',
      exposedPorts: [8080],
      minDisk: 15,
      minVram: 16
    }
  },
  {
    id: 'deepfake',
    name: 'Deepfake Studio',
    description: 'Professional video synthesis and face swapping with advanced controls',
    type: 'video',
    tags: ['Video', 'AI'],
    iconBg: 'bg-red-500/10',
    features: [
      'Face swapping',
      'Video synthesis',
      'Real-time processing',
      'High-quality output'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/deepfake-gpulab:latest',
      exposedPorts: [8080],
      minDisk: 30,
      minVram: 32
    }
  },
  {
    id: '3d-server',
    name: '3D Server',
    description: '3D model generation and rendering with real-time capabilities',
    type: '3d',
    tags: ['3D', 'Rendering'],
    iconBg: 'bg-blue-500/10',
    features: [
      '3D model generation',
      'Real-time rendering',
      'Texture synthesis',
      'Animation support'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/3d-gpulab:latest',
      exposedPorts: [8080, 3754],
      minDisk: 20,
      minVram: 24
    }
  },
  {
    id: 'audio-server',
    name: 'Audio Server',
    description: 'Audio processing and generation with support for multiple formats',
    type: 'audio',
    tags: ['Audio', 'Text-to-Speech'],
    iconBg: 'bg-pink-500/10',
    features: [
      'Text to speech',
      'Voice cloning',
      'Audio enhancement',
      'Format conversion'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/audio-gpulab:latest',
      exposedPorts: [8080],
      minDisk: 10,
      minVram: 16
    }
  },
  {
    id: 'custom-model',
    name: 'Custom Model',
    description: 'Upload and use your own AI models',
    type: 'custom',
    tags: ['Custom', 'Model'],
    iconBg: 'bg-gray-500/10',
    features: [
      'Model Upload',
      'Private/Public Models',
      'Multiple Formats Support'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/custom-gpulab:latest',
      exposedPorts: [8080],
      minDisk: 10,
      minVram: 16
    }
  },
  {
    id: 'interior-architect',
    name: 'Interior Architect',
    description: 'Generate and customize interior designs from room images',
    type: 'interior',
    tags: ['Interior', 'Design'],
    iconBg: 'bg-orange-500/10',
    features: [
      'Interior Design',
      'Floor Planning',
      'Room Decoration'
    ],
    defaultConfig: {
      containerImage: 'adhikjoshi/interior-gpulab:latest',
      exposedPorts: [8080],
      minDisk: 10,
      minVram: 16
    }
  }
];
