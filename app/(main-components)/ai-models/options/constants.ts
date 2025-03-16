export const categoryToType = {
  "All": "all",
  "Image Generation": "image",
  "API Services": "api",
  "AI Agents": "agent",
  "Video Processing": "video",
  "Model Serving": "server",
  "Language Models": "text",
  "3D Generation": "3d",
  "Real-time AI": "realtime",
  "Audio Processing": "audio",
  "Custom": "custom"
};

export const filterOptions = {
  category: {
    name: "Category",
    filters: [
      "All",
      "Image Generation",
      "API Services",
      "AI Agents",
      "Video Processing",
      "Model Serving",
      "Language Models",
      "3D Generation",
      "Real-time AI",
      "Audio Processing",
      "Custom"
    ]
  },
  view: {
    options: ["explore", "my-models"],
    labels: {
      explore: "Explore Models",
      "my-models": "My Models"
    }
  }
};

export const defaultDockerConfig = {
  templateName: '',
  containerImage: '',
  exposedPorts: [],
  containerDisk: 10,
  volumeDisk: 20,
  minVram: 8
};

export const defaultNetworkVolume = {
  volumeName: '',
  diskSize: 10,
  volumeType: 'local'
};

export type DeploymentStep = {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  message: string;
};

export const deploymentSteps: DeploymentStep[] = [
  {
    id: 'docker',
    name: 'Docker Configuration',
    status: 'pending',
    message: 'Configure container settings'
  },
  {
    id: 'network',
    name: 'Network Setup',
    status: 'pending',
    message: 'Configure network and endpoint settings'
  },
  {
    id: 'gpu',
    name: 'GPU Selection',
    status: 'pending',
    message: 'Select GPU resources for your model'
  },
  {
    id: 'deployment',
    name: 'Deployment Progress',
    status: 'pending',
    message: 'Deploying your model...'
  }
];
