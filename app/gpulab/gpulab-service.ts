import { GPULabModelConfig, GPULabResponse, NetworkVolume } from './types';
import { PYTORCH_MODEL_CONFIG } from './config';

export class GPULabClient {
  private static instance: GPULabClient;
  private apiKey: string | null = null;
  private initialized = false;

  private constructor() {
    // Try to get API key from environment or localStorage
    if (typeof window !== 'undefined') {
      const storedApiKey = localStorage.getItem('gpulab_api_key');
      if (storedApiKey) {
        this.apiKey = storedApiKey;
        this.initialized = true;
        console.log('[GPULab] Initialized with stored API key');
      }
    }
    
    const envApiKey = process.env.NEXT_PUBLIC_GPULAB_API_KEY;
    if (envApiKey && !this.initialized) {
      this.apiKey = envApiKey;
      this.initialized = true;
      // console.log('[GPULab] Initialized with environment API key');
    }
  }

  public static getInstance(): GPULabClient {
    if (!GPULabClient.instance) {
      GPULabClient.instance = new GPULabClient();
    }
    return GPULabClient.instance;
  }

  public initialize(apiKey: string): void {
    this.apiKey = apiKey;
    this.initialized = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gpulab_api_key', apiKey);
    }
    console.log('[GPULab] Initialized with provided API key');
  }

  private checkInitialization(): void {
    if (!this.initialized || !this.apiKey) {
      throw new Error('GPULabClient must be initialized with an API key first');
    }
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    body?: any,
    headers?: any
  ): Promise<T> {
    this.checkInitialization();
    
    console.log(`[GPULab] Making ${method} request to ${endpoint}`);
    if (body) {
      console.log('[GPULab] Request body:', JSON.stringify(body, null, 2));
    }
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`https://api.gpulab.ai${endpoint}`, {
        method,
        headers: {
          'api-key': this.apiKey!,
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('[GPULab] API request failed:', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData ? JSON.stringify(errorData) : response.statusText);
      }

      const data = await response.json();
      console.log(`[GPULab] Response from ${endpoint}:`, JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      console.error('[GPULab] Request error:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request to ${endpoint} timed out after 30 seconds`);
        }
      }
      throw error;
    }
  }

  async createModel(): Promise<GPULabResponse> {
    return this.request<GPULabResponse>('/model-upload', 'POST', {
      name: "Pytorch789",
      image_name: "adhikjoshi/pytorch-gpulab:latest",
      author_url: "https://github/GPULab-AI",
      category_id: 1,
      min_vram: 0,
      isVisible: true,
      container_port: "8888",
      container_disk: 50,
      volume_disk: 50,
      volume_mount_path: "/workspace",
      docker_command: null,
      env_vars: null,
      credentials_id: null,
      readme: "PyTorch model for GPU acceleration",
      thumbnail_url: "https://raw.githubusercontent.com/pytorch/pytorch/main/docs/source/_static/img/pytorch-logo-dark.png"
    });
  }

  async createVolume(): Promise<GPULabResponse> {
    return this.request<GPULabResponse>('/nas-server', 'POST', {
      template_name: "pytorch1-volume",
      volume_space: 50,
      unit: "GB",
      region_type: "us-west"
    });
  }

  async createContainer(volumeIdentifier: string, gpuType: string, gpuCount: number, existingContainerAddress: string): Promise<GPULabResponse> {
      
    const payload = {
      model_id: 320,
      gpu_type: gpuType,
      gpu_count: 1,
      volume_container_identifier: volumeIdentifier
    };
    
    console.log('[GPULab] Creating container with payload:', payload);
    return this.request<GPULabResponse>('/container/deploy', 'POST', payload);
  }

  async getContainerList(): Promise<any[]> {
    const response = await this.request<{status: string; message: any[]}>('/containers', 'GET');
    if (response.status !== 'success' || !Array.isArray(response.message)) {
      throw new Error('Failed to get container list');
    }
    return response.message;
  }

  async getContainerAddress(volumeIdentifier: string): Promise<string | null> {
    try {
      const containers = await this.getContainerList();
      const container = containers.find(c => 
        c.nas_server?.volume_server_identifier === volumeIdentifier && 
        c.container_status !== 'terminated'
      );
      return container?.container_address || null;
    } catch (error) {
      console.error('[GPULab] Failed to get container address:', error);
      return null;
    }
  }

  async getContainerStatus(containerId: string): Promise<any> {
    return this.request('/containerstats', 'GET', null, {
      'container_id': containerId
    });
  }

  async listNetworkVolumes(): Promise<NetworkVolume[]> {
    console.log('[GPULab] Listing network volumes...');
    return this.request<NetworkVolume[]>('/nas-servers', 'GET');
  }

  async getVolumeIdentifier(): Promise<string> {
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        // First try to get existing volume
        const volumes = await this.listNetworkVolumes();
        console.log('[GPULab] Found volumes:', volumes);
        
        const existingVolume = volumes.find(v => v.template_name === "pytorch1-volume");
        if (existingVolume?.volume_server_identifier) {
          console.log('[GPULab] Using existing volume:', existingVolume);
          return existingVolume.volume_server_identifier;
        }

        // If no existing volume, create new one
        console.log('[GPULab] No existing volume found, creating new one...');
        const volumeRes = await this.createVolume();
        console.log('[GPULab] Volume creation response:', volumeRes);

        // Wait a bit and list volumes again to get the identifier
        console.log('[GPULab] Waiting for volume to be ready...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const updatedVolumes = await this.listNetworkVolumes();
        console.log('[GPULab] Updated volumes:', updatedVolumes);
        
        const newVolume = updatedVolumes.find(v => v.template_name === "pytorch1-volume");
        if (!newVolume?.volume_server_identifier) {
          throw new Error('Failed to get volume identifier after creation');
        }

        console.log('[GPULab] Using new volume:', newVolume);
        return newVolume.volume_server_identifier;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw error;
        }
        console.log(`[GPULab] Retry ${retries}/${maxRetries} after error:`, error);
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
      }
    }
    
    throw new Error('Failed to get volume identifier after max retries');
  }

  async deployModel(): Promise<GPULabResponse> {
    console.log('[GPULab] Starting deployment process...');
    try {
      console.log('[GPULab] Getting volume identifier...');
      const volumeIdentifier = await this.getVolumeIdentifier();
      console.log('[GPULab] Volume identifier obtained:', volumeIdentifier);

      console.log('[GPULab] Creating model...');
      const modelRes = await this.createModel();
      console.log('[GPULab] Model creation response:', JSON.stringify(modelRes, null, 2));

      const result = {
        status: 'success',
        data: {
          model: modelRes.data,
          volume_identifier: volumeIdentifier
        }
      };
      console.log('[GPULab] Final deployment result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('[GPULab] Deployment failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async deleteContainer(address: string): Promise<void> {
    this.checkInitialization();
    await this.request<void>('/container', 'DELETE', {
      address: address
    });
  }
}