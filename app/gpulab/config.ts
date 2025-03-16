import { GPULabModelConfig } from './types';

export const PYTORCH_MODEL_CONFIG: GPULabModelConfig = {
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
    thumbnail: "https://raw.githubusercontent.com/pytorch/pytorch/master/docs/source/_static/img/pytorch-logo-dark.png",
    gpu_config: {
        gpu_type: "RTX4090",
        gpu_count: 1
    }
};
