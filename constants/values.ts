import { Brain, Zap, Bot, Video, MessageSquare, Box, Activity, Music, Image as ImageIcon, Clock } from 'lucide-react';
import { StaticImageData } from 'next/image';

export const FeatureOptions = [
    {
      label: "Dashboard",
      icon: "/dashboard.svg",
      href: "/dashboard",
    },
    {
      label: "GPU Marketplace",
      icon: "/gpu-marketplace.svg",
      href: "/gpu-marketplace",
    },
    {
      label: "AI Models",
      icon: "/ai-models.svg",
      href: "/ai-models",
    },
    {
      label: "Earnings",
      icon: "/earnings.svg",
      href: "/earnings",
    },
    {
      label: "Connect to Earn",
      icon: "/connect-to-earn.svg",
      href: "/connect-to-earn",
    },
    {
      label: "Wallet",
      icon: "/wallet.svg",
      href: "/wallet",
    }
  ];

export const SettingsOptions = [
    {
      label: "Community",
      icon: "/community.svg",
      href: "/community",
    },
    {
      label: "Settings",
      icon: "/settings.svg",
      href: "/settings",
    },
    {
      label: "More info",
      icon: "/info.svg",
      href: "/more-info",
    }
  ];

export const filters = []

export const AIModelData = [
  {
    name: "Generation",
    options: ["GPT-3", "GPT-4", "GPT-5"],
  },
  {
    name: "Category",
    options: ["Text", "Image", "Audio"],
  }
]

export const mainServices: {name:string, description:string, href:string}[] = [
  {
    name: "GPU Marketplace",
    description:
            `Access high-performance GPU computing on demand. Choose from our network 
             of 200+ verified GPU nodes. Pay only for what you use, starting at $0.30 
             per GPU hour - up to 80% cheaper than traditional cloud providers.`,
    href: "/gpu-marketplace"
  },
  {
    name: "AI Models",
    description: 
            `Deploy and scale AI models with just a few clicks. Choose from our pre-built
             models or deploy your custom models. Zero setup time, 
             instant deployment, and seamless integration with popular ML frameworks.`,
    href: "/ai-models"
  },
  {
    name: "Connect to Earn",
    description: 
            `Turn your idle GPU power into passive income through our browser-based mining 
             platform. No downloads required - just connect through your browser. Join our 
             network of providers earning rewards while supporting the AI revolution.`,
    href: "/connect-to-earn"
  }
]

type GPUDataType = {
  gpuModel: string;
  host: string;
  location: string;
  imgSrc: string | StaticImageData;
  computeMode: number;
  cores: number;
  gpuMemory: string;
  maxCudaVersion: string;
  cpuModel: string;
  totalMemory: string;
  storageSpeed: string;
  storageSize: string;
  motherboard: string;
  smClock: string;
  rentPrice: string;
};

export const GPUData: GPUDataType[] = [
  {
    gpuModel: "1x NVIDIA GeForce RTX 3090",
    host: "Cc23fb45-1276-497a-8349-259659fa6b80",
    location: "Kanayannur Kerala IN (Asia/Kolkata)",
    imgSrc: "/gpu marketplace/rtx3090.png",
    computeMode: 0,
    cores: 10496,
    gpuMemory: "0 GB",
    maxCudaVersion: "535.183.01",
    cpuModel: "AMD Ryzen 9 7900X",
    totalMemory: "61.95 GB",
    storageSpeed: "2252.6 MB/s",
    storageSize: "344 GB",
    motherboard: "ASUSTek Computer INC.",
    smClock: "210 MHz",
    rentPrice: "1001 $NLOV/Hr",
  },
  {
    gpuModel: "1x NVIDIA GeForce RTX 4090",
    host: "Cc23fb45-1276-497a-8349-259659fa6b80",
    location: "Kanayannur Kerala IN (Asia/Kolkata)",
    imgSrc: "/gpu marketplace/rtx4090.png",
    computeMode: 0,
    cores: 10496,
    gpuMemory: "0 GB",
    maxCudaVersion: "535.183.01",
    cpuModel: "AMD Ryzen 9 7900X",
    totalMemory: "61.95 GB",
    storageSpeed: "2252.6 MB/s",
    storageSize: "344 GB",
    motherboard: "ASUSTek Computer INC.",
    smClock: "210 MHz",
    rentPrice: "1001 $VLOV/Hr",
  },
];

export const chartData = [
  { activity: "Done", value: 28, color: "#818181" },
  { activity: "Overdue Work", value: 22, color: "#0055ff" },
  { activity: "Processing", value: 30, color: "#00ffbf" },
  { activity: "Work Finished Late", value: 20, color: "#356cf9" },
];

export const trafficData = [
  {
    activity: "Social Media", value: 22, color:"#F97316"
  },
  {
    activity: "Organic Search", value: 78, color:"#ffffff"
  }
]

export const accountSummary = {
    name: 'Samantha Jeffery',
    rating: 4.3,
    image: '',
    badges: [
      {
        type: 'gold',
        image: '',
        active: true
      },
      {
        type: 'silver',
        image: '',
        active: false
      },
      {
        type: 'bronze',
        image: '',
        active: false
      }
    ]
  };

export  const posts = [
    {
      id: 1,
      title: 'Blockchain developer best practices on innovation chain',
      author: {
        name: 'Peret Grey',
        avatar: '',
        role: '1 week ago'
      },
      stats: {
        views: '670,606',
        likes: '29,751',
        comments: '209'
      },
      tags: ['blockchain', 'development', 'best practices'],
      graph: ''
    },
    {
      id: 2,
      title: 'The 4-step SEO framework that led to a 1000% increase in traffic. Let\'s talk about blogging and SEO...',
      author: {
        name: 'Ali Juby',
        avatar: '',
        role: '3 days ago'
      },
      stats: {
        views: '670,606',
        likes: '29,751',
        comments: '209'
      },
      tags: ['seo', 'marketing', 'growth'],
      graph: ''
    },
    {
      id: 3,
      title: 'OnePay - Online Payment Processing Web App - Download from ui8.net',
      author: {
        name: 'Mamunul Haque',
        avatar: '',
        role: '1 week ago'
      },
      stats: {
        views: '670,606',
        likes: '29,751',
        comments: '209'
      },
      tags: ['payment', 'webapp', 'ui'],
      graph: ''
    }
  ];

  export const meetups = [
    {
      id: 1,
      date: { month: 'FEB', day: '7' },
      title: 'UIHUT - Crunchbase Company Profile...',
      tags: ['Remote', 'Full Time', 'Available'],
      company: {
        name: 'UIHUT',
        state: 'Sylhet',
        country: 'Bangladesh',
        logo: ''
      }
    },
    {
      id: 2,
      date: { month: 'FEB', day: '3' },
      title: 'Design Meetups USA | Dribbble',
      tags: ['Remote', 'Full Time'],
      company: {
        name: 'Dribbble',
        state: 'Austin',
        country: 'USA',
        logo: ''
      }
    },
    {
      id: 3,
      date: { month: 'FEB', day: '5' },
      title: 'Meetup Brand Identity Design - Behi...',
      tags: ['Full Time', 'Contract', 'Available'],
      company: {
        name: 'Behance',
        state: 'san jose, CA',
        country: 'USA',
        logo: ''
      }
    }
  ];


  export const dashboardDta = [
    {
      name: 'Total Nodes',
      value: 12,
    },
    {
      name: "Total GPUs",
      value: 415,
    },
    {
      name: "Total Rental Duration",
      value: 27000,
    },
    {
      name: "Average Rental Cost",
      value: 12.99,
    }
  ]
  

export const footer = [
  {
    name: "GitHub",
    href: "https://github.com/neurolov",
    icon: "/github.svg",
  },
  {
    name: "Twitter",
    href: "https://x.com/neurolov?t=pv9d_FGxA7votvinyouU6Q&s=09",
    icon: "/twitter.svg",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/neurolov-ai/",
    icon: "/linkedin.svg",
  },
  {
    name: "Discord",
    href: "https://discord.gg/neurolov",
    icon: "/discord.svg",
  },
  {
    name: "Website",
    href: "https://neurolov.ai",
    icon: "/website.svg",
  },
  {
    name: "Email",
    href: "mailto:support@neurolov.ai",
    icon: "/email.svg",
  }
]

export interface GPU {
  id: string;
  name: string;
  image: string;
  available: boolean;
  price: {
    usd: number;
    nlov: number;
  };
  specs: {
    cores: string;
    tmus: string;
    rops: string;
    rtCores: string;
    available: number;
  };
}

export const gpuData: GPU[] = [
  {
    id: 'rtx4090',
    name: 'NVIDIA GeForce RTX 4090',
    image: '/gpu-images/RTX-4090.png',
    available: true,
    specs: {
      cores: '16384 CUDA Cores',
      boost: '2.52 GHz Boost Clock',
      vram: 24
    },
    price: {
      usd: 0.40,
      nlov: 0.63
    }
  },
  {
    id: 'rtx3090ti',
    name: 'NVIDIA GeForce RTX 3090 Ti',
    image: '/gpu-images/RTX-3090ti.png',
    available: true,
    specs: {
      cores: '10752 CUDA Cores',
      boost: '1.86 GHz Boost Clock',
      vram: 24
    },
    price: {
      usd: 0.30,
      nlov: 0.56
    }
  },
  {
    id: 'rtx3090',
    name: 'NVIDIA GeForceRTX 3090',
    image: '/gpu-images/RTX-3090.png',
    available: true,
    specs: {
      cores: '10496 CUDA Cores',
      boost: '1.70 GHz Boost Clock',
      vram: 24
    },
    price: {
      usd: 0.25,
      nlov: 0.49
    }
  },
  {
    id: 'a6000',
    name: 'NVIDIA A6000',
    image: '/gpu-images/A-6000.png',
    available: false,
    specs: {
      cores: '10752 CUDA Cores',
      boost: '1.80 GHz Boost Clock',
      vram: 48
    },
    price: {
      usd: 0.90,
      nlov: 0.63
    }
  },
  {
    id: 'a5000',
    name: 'NVIDIA A5000',
    image: '/gpu-images/A-5000.png',
    available: false,
    specs: {
      cores: '8192 CUDA Cores',
      boost: '1.73 GHz Boost Clock',
      vram: 24
    },
    price: {
      usd: 0.70,
      nlov: 0.56
    }
  },
  {
    id: 'a4000',
    name: 'NVIDIA A4000',
    image: '/gpu-images/A-4000.png',
    available: false,
    specs: {
      cores: '6144 CUDA Cores',
      boost: '1.56 GHz Boost Clock',
      vram: 16
    },
    price: {
      usd: 0.50,
      nlov: 0.49
    }
  },
  {
    id: 'h100',
    name: 'NVIDIA H100',
    image: '/gpu-images/H-100.png',
    available: false,
    specs: {
      cores: '16896 CUDA Cores',
      boost: '1.98 GHz Boost Clock',
      vram: 80
    },
    price: {
      usd: 3.5,
      nlov: 2.45
    }
  },
  {
    id: 'a40',
    name: 'NVIDIA A40',
    image: '/gpu-images/A-40.png',
    available: false,
    specs: {
      cores: '10752 CUDA Cores',
      boost: '1.86 GHz Boost Clock',
      vram: 48
    },
    price: {
      usd: 0.70,
      nlov: 0.84
    }
  },
  {
    id: 'a100',
    name: 'NVIDIA A100',
    image: '/gpu-images/A-100.png',
    available: false,
    specs: {
      cores: '6912 CUDA Cores',
      boost: '1.41 GHz Boost Clock',
      vram: 80
    },
    price: {
      usd: 1.5,
      nlov: 1.75
    }
  }
];

export interface AIModel {
  id: string;
  name: string;
  description: string;
  // image: StaticImageData
  icon: any;
  price: number;
  type: string;
  tags: string[];
  // framework: string;
  // recommended: boolean;
  // pricePerHour: number;
}

export const models : AIModel[] = [
  {
    id: '1',
    name: 'Flux Image Gen',
    description: 'High-performance image generation and manipulation',
    icon: ImageIcon,
    price: 8,
    type: 'image',
    tags: ['Premium', 'Fast']
  },
  {
    id: '2',
    name: 'Fast API',
    description: 'High-speed API development and deployment',
    icon: Zap,
    price: 5,
    type: 'api',
    tags: ['Fast', 'Efficient']
  },
  {
    id: '3',
    name: 'AI Super Agents',
    description: 'Advanced autonomous AI agents for complex tasks',
    icon: Brain,
    price: 12,
    type: 'agent',
    tags: ['Premium', 'Advanced']
  },
  {
    id: '4',
    name: 'Deepfake',
    description: 'Advanced video synthesis and manipulation',
    icon: Video,
    price: 15,
    type: 'video',
    tags: ['Premium', 'High-Quality']
  },
  {
    id: '5',
    name: 'PyTorch',
    description: 'Deep learning and neural network training',
    icon: Brain,
    price: 10,
    type: 'ml',
    tags: ['Open Source', 'Flexible']
  },
  {
    id: '6',
    name: 'LLM Server',
    description: 'Large Language Model hosting and inference',
    icon: MessageSquare,
    price: 20,
    type: 'text',
    tags: ['Premium', 'Scalable']
  },
  {
    id: '7',
    name: '3D Server',
    description: '3D model generation and rendering',
    icon: Box,
    price: 18,
    type: '3d',
    tags: ['Premium', 'High-Performance']
  },
  {
    id: '8',
    name: 'Realtime',
    description: 'Real-time AI processing and inference',
    icon: Clock,
    price: 25,
    type: 'realtime',
    tags: ['Premium', 'Low-Latency']
  },
  {
    id: '9',
    name: 'Audio Server',
    description: 'Audio processing and generation',
    icon: Music,
    price: 15,
    type: 'audio',
    tags: ['Premium', 'High-Fidelity']
  }
];