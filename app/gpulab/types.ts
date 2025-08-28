export interface GPULabModelConfig {
    name: string;
    image_name: string;
    author_url: string;
    category_id: number;
    min_vram: number;
    isVisible: boolean;
    container_port: string;
    container_disk: number;
    volume_disk: number;
    volume_mount_path: string;
    thumbnail: string;
}

export interface GPULabResponse {
    status: string;
    message?: string;
    container_id?: string;
    data?: {
        model_id?: number;
        volume_id?: string;
        container_identifier?: string;
        [key: string]: any;
    };
}

export interface ModelDeploymentStatus {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    endpoint?: string;
}

export interface NetworkVolume {
    id: number;
    volume_server_identifier: string;
    unit: string | null;
    notes: string | null;
    volume_space: number;
    template_name: string;
    region_type: string | null;
}

export interface GPUInfo {
    gpu_type: string;
    mem_used_percent: number;
    gpu_status: boolean;
    physical_system_id: number;
    tunnel_id: number;
    id: number;
    gpu_uuid: string;
    total_memory: number;
    memory_used: number;
    gpu_index: string;
    gpuprice: string;
}

export interface Container {
    server_name: string | null;
    opened_ports: string;
    nas_server_id: number;
    container_address: string;
    container_status: string;
    isVisible: boolean;
    container_error: string;
    notes: string | null;
    image_address: string;
    created_at: string;
    model_id: number;
    parent_system_id: number;
    id: number;
    public_urls: string;
    exposed_container_vm_fk: number;
    gpus: GPUInfo[];
    nas_server: NetworkVolume;
    system_uptime: string;
    model_name: string;
    model_image_name: string;
    src: string;
}

export interface ContainerListResponse {
    status: string;
    message?: string;
    data?: Container[];
}
