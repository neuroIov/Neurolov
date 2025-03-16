'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Loader2, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from '@/app/auth/useUser';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import OpenAI from 'openai';

interface ArtStyle {
  name: string;
  description: string;
  prompt: string;
}

const artStyles: ArtStyle[] = [
  {
    name: 'Photorealistic',
    description: 'Highly detailed and lifelike images',
    prompt: 'Create a photorealistic image with high detail and natural lighting'
  },
  {
    name: 'Anime',
    description: 'Japanese animation style',
    prompt: 'Create an anime-style illustration with vibrant colors and expressive features'
  },
  {
    name: 'Digital Art',
    description: 'Modern digital illustration style',
    prompt: 'Create a digital art piece with bold colors and clean lines'
  },
  {
    name: 'Oil Painting',
    description: 'Classical oil painting style',
    prompt: 'Create an oil painting with rich textures and classical composition'
  }
];

function enhancePrompt(prompt: string, style: ArtStyle): string {
  return `${style.prompt}, specifically: ${prompt}. Ensure high quality, detailed output with professional composition and lighting.`;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  timestamp: string;
  style?: ArtStyle;
}

export default function FluxImageGenerator() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imageCount, setImageCount] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(artStyles[0]);

  // Initialize OpenAI client (masked as Flux Generator)
  const imageGenerator = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  const generateImages = async () => {
    if (!user) {
      toast.error('Please sign in to generate images');
      return;
    }

    try {
      setLoading(true);
      const newImages: GeneratedImage[] = [];

      // Enhance the prompt with selected style and Flux-specific enhancements
      const enhancedPrompt = enhancePrompt(prompt, selectedStyle);

      for (let i = 0; i < imageCount; i++) {
        try {
          // Generate image using OpenAI (masked as Flux)
          const response = await imageGenerator.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: selectedStyle.name === 'Photorealistic' ? 'natural' : 'vivid',
          });

          if (response.data[0].url) {
            newImages.push({
              url: response.data[0].url,
              prompt,
              enhancedPrompt,
              timestamp: new Date().toISOString(),
              style: selectedStyle
            });
          }
        } catch (error) {
          console.error('Error in Flux generation:', error);
          toast.error(`Flux engine failed to generate image ${i + 1}. Please try again.`);
        }
      }

      if (newImages.length > 0) {
        setGeneratedImages(prev => [...newImages, ...prev]);
        toast.success(`Successfully generated ${newImages.length} image${newImages.length > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      toast.error("Error generating images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="default"
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <span className="relative flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Try Flux
            </span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-gradient-to-b from-gray-900 to-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Flux Image Generator
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Harness the power of Flux AI to generate stunning, professional-grade images.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="style" className="text-gray-200">Flux Style</Label>
            <Select 
              value={selectedStyle.name} 
              onValueChange={(value) => setSelectedStyle(artStyles.find(style => style.name === value) as ArtStyle)}
            >
              {artStyles.map(style => (
                <SelectItem key={style.name} value={style.name}>
                  {style.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt" className="text-gray-200">Vision Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe your vision for Flux to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-200"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageCount" className="text-gray-200">Number of Images</Label>
            <Select 
              value={imageCount.toString()} 
              onValueChange={(value) => setImageCount(parseInt(value))}
            >
              {[1, 2, 3, 4].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'image' : 'images'}
                </SelectItem>
              ))}
            </Select>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={generateImages} 
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : null}
              {loading ? 'Generating...' : `Generate ${imageCount} Image${imageCount > 1 ? 's' : ''}`}
            </Button>
          </motion.div>

          <AnimatePresence>
            <motion.div 
              className="grid grid-cols-2 gap-4 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {generatedImages.map((image, index) => (
                <motion.div
                  key={index}
                  className="relative group rounded-lg overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <img 
                    src={image.url} 
                    alt={`Generated ${index + 1}`}
                    className="w-full h-auto rounded-lg border border-gray-700 transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 text-sm rounded-b-lg transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="font-medium">Vision: {image.prompt}</p>
                    <p className="text-xs text-gray-300 mt-1">Style: {image.style?.name}</p>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(image.timestamp).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
