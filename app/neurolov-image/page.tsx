'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Download,
  Image,
  Palette,
  Wand2,
  Loader2,
  Sparkles,
  Trash2,
  X,
  Settings,
  Share2,
  Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from '@/app/auth/useUser';
import './neuroStyle.css';

interface ChatMessage {
  type: 'prompt' | 'response';
  content: string;
  image?: string;
  metadata?: {
    size?: string;
    style?: string;
    enhance?: boolean;
  };
}

export default function NeuroImageGenerator() {
  const router = useRouter();
  const { user } = useUser();
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [enhance, setEnhance] = useState(true);
  const [showSizeDialog, setShowSizeDialog] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeShareIndex, setActiveShareIndex] = useState<number | null>(null);

  // Hide sensitive API endpoint logging in production.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        if (args.some(arg => typeof arg === 'string' && arg.includes('/api/Neurolov-image-generator'))) {
          return;
        }
        originalLog(...args);
      };
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest';
      setUserName(name);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`image_gen_history_${user.id}`);
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    }
  }, [user]);

  React.useEffect(() => {
    if (user && chatHistory.length > 0) {
      localStorage.setItem(`image_gen_history_${user.id}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, user]);

  const handleBack = () => {
    router.push('/ai-models');
  };

  // Return a ControlNet config based on the selected style.
  const getControlnetConfig = (style: string) => {
    switch (style) {
      case 'photorealistic':
        return {
          model: 'controlnet-photorealistic',
          guidance_scale: 1.0,
          strength: 0.8,
        };
      case 'painting':
        return {
          model: 'controlnet-painting',
          guidance_scale: 0.9,
          strength: 0.7,
        };
      case 'cartoon':
        return {
          model: 'controlnet-cartoon',
          guidance_scale: 1.1,
          strength: 0.85,
        };
      case 'abstract':
        return {
          model: 'controlnet-abstract',
          guidance_scale: 1.2,
          strength: 0.9,
        };
      case 'anime':
        return {
          model: 'controlnet-anime',
          guidance_scale: 1.0,
          strength: 0.8,
        };
      default:
        return null;
    }
  };

  // Append a style-specific hint to the prompt.
  const getStyledPrompt = (basePrompt: string, style: string) => {
    let styleHint = '';
    switch (style) {
      case 'photorealistic':
        styleHint = ' in a photorealistic style';
        break;
      case 'painting':
        styleHint = ' as a beautiful painting with brush strokes and vivid colors';
        break;
      case 'cartoon':
        styleHint = ' in a vibrant cartoon style with bold lines and bright colors';
        break;
      case 'abstract':
        styleHint = ' in an abstract style with imaginative shapes and colors';
        break;
      case 'anime':
        styleHint = ' in an anime style with sharp lines and dramatic expressions';
        break;
      default:
        styleHint = '';
    }
    return basePrompt + styleHint;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    // Show progress dialog and start progress simulation.
    setShowProgressDialog(true);
    setGenerationProgress(0);
    const intervalId = setInterval(() => {
      setGenerationProgress(prev => (prev < 90 ? prev + 3 : prev));
    }, 100);

    // Create a prompt that includes style-specific hints.
    const finalPrompt = getStyledPrompt(prompt, selectedStyle);

    // Log only the raw prompt in history.
    const promptMessage: ChatMessage = { type: 'prompt', content: prompt };
    setChatHistory(prev => [...prev, promptMessage]);

    try {
      const [width, height] = selectedSize.split('x').map(Number);
      const controlnetConfig = getControlnetConfig(selectedStyle);

      const response = await fetch('/api/Neurolov-image-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          width,
          height,
          num_samples: 1,
          enhance_prompt: enhance,
          art_style: selectedStyle,
          negative_prompt: 'blurry, low quality, distorted, deformed',
          controlnet: controlnetConfig
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate image');
      if (data.images?.[0]) {
        const responseMessage: ChatMessage = {
          type: 'response',
          content: prompt,
          image: data.images[0],
          metadata: {
            size: selectedSize,
            style: selectedStyle,
            enhance
          }
        };
        setChatHistory(prev => [...prev, responseMessage]);
      }
      setGenerationProgress(100);
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage: ChatMessage = {
        type: 'response',
        content: 'Failed to generate image. The system will automatically try alternative services.',
      };
      setChatHistory(prev => [...prev, errorMessage]);
      setGenerationProgress(100);
    } finally {
      clearInterval(intervalId);
      setIsGenerating(false);
      setPrompt('');
      setTimeout(() => {
        setShowProgressDialog(false);
        setGenerationProgress(0);
      }, 500);
    }
  };

  const handleDownload = (image: string) => {
    fetch(image)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const fileName = `neurolov-image-${Date.now()}.png`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => console.error('Error downloading image:', error));
  };

  const handleClearHistory = () => {
    if (user) {
      localStorage.removeItem(`image_gen_history_${user.id}`);
      setChatHistory([]);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Sharing functions for individual images.
  const shareImageOnTwitter = (imageUrl: string) => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent("Check out this cool image!")}`;
    window.open(url, '_blank');
    setActiveShareIndex(null);
  };

  const shareImageOnInstagram = (imageUrl: string) => {
    window.open('https://www.instagram.com', '_blank');
    setActiveShareIndex(null);
  };

  const shareImageOnTelegram = (imageUrl: string) => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent("Check out this cool image!")}`;
    window.open(url, '_blank');
    setActiveShareIndex(null);
  };

  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      alert('Image URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy!', err);
    }
    setActiveShareIndex(null);
  };

  // Global sharing functions.
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent("Check out this cool image!")}`;
    window.open(url, '_blank');
    setShowShareDialog(false);
  };

  const shareOnInstagram = () => {
    window.open('https://www.instagram.com', '_blank');
    setShowShareDialog(false);
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent("Check out this cool image!")}`;
    window.open(url, '_blank');
    setShowShareDialog(false);
  };

  const sizeOptions = ['512x512', '1024x1024'];
  const styleOptions = ['photorealistic', 'painting', 'cartoon', 'abstract', 'anime'];

  return (
    <>
      <div className="main-content" style={{ left: 0 }}>
        <div className="sticky-header compact-header">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft className="icon" />
            All AI Models
          </button>
        </div>

        <div className="image-gen" style={{ maxWidth: '1200px' }}>
          <div className="header-row">
            <div className="welcome-header">
              <h2 className="greeting">
                Hi there, <span className="name">{userName}</span> what would you like to imagine today?
              </h2>
            </div>
          </div>

          <div className="generated-images">
            {chatHistory.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                {message.type === 'prompt' ? (
                  <div className="message-content">
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <div className="image-card" style={{ position: 'relative' }}>
                    <img src={message.image} alt={message.content} onClick={() => handleImageClick(message.image!)} />
                    <div className="image-overlay">
                      <div className="image-metadata">
                        {message.metadata?.size && <span className="metadata-tag">{message.metadata.size}</span>}
                        {message.metadata?.style && <span className="metadata-tag">{message.metadata.style}</span>}
                        {message.metadata?.enhance && <span className="metadata-tag enhance">Enhanced</span>}
                      </div>
                    </div>
                    <button
                      className="share-icon"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '4px',
                        cursor: 'pointer',
                        zIndex: 2,
                        boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => setActiveShareIndex(activeShareIndex === index ? null : index)}
                      aria-label="Share image"
                    >
                      <Share2 className="icon" style={{ color: 'black' }} />
                    </button>
                    {activeShareIndex === index && (
                      <div
                        className="share-overlay"
                        style={{
                          position: 'absolute',
                          top: '40px',
                          right: '8px',
                          background: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '4px',
                          zIndex: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          color: 'black'
                        }}
                      >
                        <Button variant="ghost" className="option" onClick={() => shareImageOnTwitter(message.image!)}>
                          Twitter
                        </Button>
                        <Button variant="ghost" className="option" onClick={() => shareImageOnInstagram(message.image!)}>
                          Instagram
                        </Button>
                        <Button variant="ghost" className="option" onClick={() => shareImageOnTelegram(message.image!)}>
                          Telegram
                        </Button>
                        <Button variant="ghost" className="option" onClick={() => copyImageToClipboard(message.image!)}>
                          <Copy className="icon" style={{ color: 'black' }} /> Copy URL
                        </Button>
                      </div>
                    )}
                    <Button className="download-button" onClick={() => handleDownload(message.image!)} aria-label="Download image">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>
              <X className="icon" />
            </button>
            <img src={selectedImage} alt="Generated" />
          </div>
        </div>
      )}

      <div className="prompt-dialog" style={{ left: 0 }}>
        <div className="prompt-input">
          <textarea
            placeholder="Enter a detailed description of what you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          <div className="feature-buttons">
            <button className="feature-button" onClick={() => setShowShareDialog(true)}>
              <Share2 className="icon" />
              Share
            </button>
            <button className="clear-history" onClick={handleClearHistory}>
              <Trash2 className="icon" />
              Clear History
            </button>
            <button className="feature-button" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="icon" />
              Settings
            </button>
            <button className="generate-button" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="icon animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="icon" />
                  Generate →
                </>
              )}
            </button>
          </div>

          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent className="dialog-content" style={{ backgroundColor: '#fff', color: 'black' }}>
              <DialogHeader>
                <DialogTitle>Share Options</DialogTitle>
              </DialogHeader>
              <div className="dialog-options share-options">
                <Button variant="ghost" className="option" onClick={shareOnTwitter}>
                  Twitter
                </Button>
                <Button variant="ghost" className="option" onClick={shareOnInstagram}>
                  Instagram
                </Button>
                <Button variant="ghost" className="option" onClick={shareOnTelegram}>
                  Telegram
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogContent className="dialog-content">
              <DialogHeader>
                <DialogTitle>Image Settings</DialogTitle>
              </DialogHeader>
              <div className="settings-options">
                <button
                  className="feature-button"
                  onClick={() => {
                    setShowSizeDialog(true);
                    setShowSettingsDialog(false);
                  }}
                >
                  <Image className="icon" />
                  Image Size
                </button>
                <button
                  className="feature-button"
                  onClick={() => {
                    setShowStyleDialog(true);
                    setShowSettingsDialog(false);
                  }}
                >
                  <Palette className="icon" />
                  Style
                </button>
                <button
                  className={`feature-button ${enhance ? 'active' : ''}`}
                  onClick={() => {
                    setEnhance(!enhance);
                    setShowSettingsDialog(false);
                  }}
                >
                  <Sparkles className="icon" />
                  Enhance
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSizeDialog} onOpenChange={setShowSizeDialog}>
            <DialogContent className="dialog-content">
              <DialogHeader>
                <DialogTitle>Select Image Size</DialogTitle>
              </DialogHeader>
              <div className="dialog-options">
                {sizeOptions.map((size) => (
                  <Button
                    key={size}
                    variant="ghost"
                    className={`option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSize(size);
                      setShowSizeDialog(false);
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showStyleDialog} onOpenChange={setShowStyleDialog}>
            <DialogContent className="dialog-content">
              <DialogHeader>
                <DialogTitle>Select Style</DialogTitle>
              </DialogHeader>
              <div className="dialog-options">
                {styleOptions.map((style) => (
                  <Button
                    key={style}
                    variant="ghost"
                    className={`option ${selectedStyle === style ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedStyle(style);
                      setShowStyleDialog(false);
                    }}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle>Image Generation Progress</DialogTitle>
          </DialogHeader>
          <div className="progress-content">
            <p>Generating image... {generationProgress}% completed</p>
            <div
              className="progress-bar"
              style={{
                backgroundColor: '#e0e0e0',
                height: '10px',
                borderRadius: '5px',
                overflow: 'hidden',
                marginTop: '10px'
              }}
            >
              <div
                className="progress"
                style={{
                  width: `${generationProgress}%`,
                  backgroundColor: '#3b82f6',
                  height: '100%',
                  transition: 'width 0.5s ease-in-out'
                }}
              ></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
