'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ImageIcon, Sparkles, Send, Download, Wand2, Image, PenTool, Layers, Palette, CircleSlash2, Combine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'image';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export default function NeuroImageGenerator() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('neurolov-image-history');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } catch (e) {
          console.error('Error parsing saved messages:', e);
          return [];
        }
      }
    }
    return [];
  });

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('neurolov-image-history', JSON.stringify(messages));
      setShowWelcome(false);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePromptSelect = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    setShowWelcome(false);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('neurolov-image-history');
    toast.success('History cleared', {
      style: { background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsGenerating(true);
    setPrompt('');

    try {
      console.log('Sending request with prompt:', prompt);
      
      const response = await fetch('/api/modelslab/text2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          width: 1024,
          height: 1024,
          num_samples: 1,
          enhance_prompt: true,
          negative_prompt: 'blurry, low quality, distorted, deformed'
        })
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      if (!data.images?.[0]) {
        console.error('Invalid response structure:', data);
        throw new Error('No image URL in response');
      }
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'image',
        content: prompt,
        imageUrl: data.images[0],
        timestamp: new Date()
      };
      
      console.log('Adding new message with image:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `neurolovaigen-${timestamp}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success('Image downloaded successfully', {
        style: { background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)' }
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  return (
    <div className="flex flex-col h-[90vh]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-medium">Neuro Image Generator</span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-xs text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-8">What would you like to create?</h1>
            <div className="grid grid-cols-2 gap-4 max-w-2xl w-full mb-8">
              <Button
                variant="outline"
                className="flex flex-col gap-2 p-6 h-auto bg-[#1A1A1A] hover:bg-[#252525] border-white/5"
                onClick={() => handlePromptSelect("Create a photorealistic portrait in renaissance style")}
              >
                <Image className="w-6 h-6" />
                <span>Photorealistic</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-2 p-6 h-auto bg-[#1A1A1A] hover:bg-[#252525] border-white/5"
                onClick={() => handlePromptSelect("Create an anime-style character with vibrant colors")}
              >
                <PenTool className="w-6 h-6" />
                <span>Anime Style</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-2 p-6 h-auto bg-[#1A1A1A] hover:bg-[#252525] border-white/5"
                onClick={() => handlePromptSelect("Generate a surreal dreamscape with floating islands")}
              >
                <Layers className="w-6 h-6" />
                <span>Surreal Art</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-2 p-6 h-auto bg-[#1A1A1A] hover:bg-[#252525] border-white/5"
                onClick={() => handlePromptSelect("Design a minimalist abstract composition")}
              >
                <Palette className="w-6 h-6" />
                <span>Abstract</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
              <Button
                variant="outline"
                className="flex flex-col gap-2 p-6 h-auto bg-[#1A1A1A] hover:bg-[#252525] border-white/5"
                onClick={() => handlePromptSelect("Remove background and create transparent PNG")}
              >
                <CircleSlash2 className="w-6 h-6" />
                <span>Remove Background</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col gap-2 p-6 h-auto bg-[#1A1A1A] hover:bg-[#252525] border-white/5"
                onClick={() => handlePromptSelect("Combine multiple styles into one unique image")}
              >
                <Combine className="w-6 h-6" />
                <span>Style Fusion</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-white/10 text-white px-4 py-3' 
                        : message.type === 'image' 
                          ? 'bg-[#1A1A1A] text-white overflow-hidden w-full md:w-1/2'
                          : 'bg-[#1A1A1A] text-white px-4 py-3'
                    }`}
                  >
                    {message.type === 'image' ? (
                      <div>
                        <div className="px-4 pt-3">
                          <p className="text-sm text-gray-300">{message.content}</p>
                        </div>
                        <div className="mt-3 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={message.imageUrl} 
                            alt={message.content}
                            className="w-full h-auto object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20"
                              onClick={() => message.imageUrl && handleDownload(message.imageUrl)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-[#1A1A1A] rounded-2xl px-4 py-3">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="shrink-0 p-4 border-t border-white/5 bg-[#0A0A0A]">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-[#1A1A1A]"
            onClick={() => setPrompt(prev => prev + "✨ ")}
          >
            <Sparkles className="w-5 h-5" />
          </Button>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="flex-1 bg-[#1A1A1A] text-white border-0 rounded-lg px-4 py-2 focus:ring-1 ring-white/20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          <Button
            className="shrink-0 bg-white/10 hover:bg-white/20"
            size="icon"
            disabled={!prompt.trim() || isGenerating}
            onClick={handleGenerate}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
