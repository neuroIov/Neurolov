import { GPULabClient } from './gpulab-service';
import { GPULabResponse } from './types';

export { GPULabClient };

// Initialize GPULab service with API key
export function initGPULab(apiKey?: string): void {
    try {
        const client = GPULabClient.getInstance();
        if (apiKey) {
            client.initialize(apiKey);
        }
        console.log('GPULab client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize GPULab client:', error);
        throw error;
    }
}

// Deploy PyTorch model
export async function deployPytorchModel(): Promise<GPULabResponse> {
    const client = GPULabClient.getInstance();
    
    try {
        console.log('Starting deployment process...');
        const response = await client.deployModel();
        console.log('Deployment response:', response);
        return response;
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
}
