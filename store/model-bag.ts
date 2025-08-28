'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: string;
  tags?: string[];
  iconBg: string;
  features?: string[];
  defaultConfig?: {
    containerImage: string;
    exposedPorts: number[];
    minDisk: number;
    minVram: number;
  };
  stats?: {
    likes: number;
    popularity: number;
    activeUsers: number;
  };
  // Additional optional properties
  link?: string;
  likes?: number;
  isNew?: boolean;
  isBeta?: boolean;
  category?: string;
  isComingSoon?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  price?: number;
  gpuRequirements?: {
    minGPU: string;
    minVRAM: number;
    minCores: number;
  };
  icon?: {
    name: string;
    color: string;
  };
}

interface ModelBagStore {
  selectedModel: AIModel | null;
  likedModels: Set<string>;
  modelLikes: Record<string, number>;
  setSelectedModel: (model: AIModel | null) => void;
  toggleLike: (modelId: string, initialLikes: number) => void;
  isLiked: (modelId: string) => boolean;
  getLikes: (modelId: string, initialLikes: number) => number;
}

export const useModelBag = create(
  persist<ModelBagStore>(
    (set, get) => ({
      selectedModel: null,
      likedModels: new Set(),
      modelLikes: {},
      setSelectedModel: (model) => set({ selectedModel: model }),
      toggleLike: (modelId, initialLikes) => set((state) => {
        const newLikedModels = new Set(state.likedModels);
        const newModelLikes = { ...state.modelLikes };
        
        if (!newModelLikes[modelId]) {
          newModelLikes[modelId] = initialLikes;
        }

        if (newLikedModels.has(modelId)) {
          newLikedModels.delete(modelId);
          newModelLikes[modelId]--;
        } else {
          newLikedModels.add(modelId);
          newModelLikes[modelId]++;
        }

        return { 
          likedModels: newLikedModels,
          modelLikes: newModelLikes
        };
      }),
      isLiked: (modelId) => get().likedModels.has(modelId),
      getLikes: (modelId, initialLikes) => get().modelLikes[modelId] ?? initialLikes,
    }),
    {
      name: 'model-bag-storage',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          if (state.likedModels) {
            state.likedModels = new Set(state.likedModels);
          }
          return { state };
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          const state = { ...value.state };
          if (state.likedModels instanceof Set) {
            state.likedModels = Array.from(state.likedModels);
          }
          localStorage.setItem(name, JSON.stringify({ state }));
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name);
        },
      },
    },
  ),
);
