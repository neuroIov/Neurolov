'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Download, Settings2, RefreshCw, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/app/utils/upload';

interface GenerationOptions {
  watermark: boolean;
}

const defaultOptions: GenerationOptions = {
  watermark: true
};

interface FileUploadProps {
  accept: string;
  onChange: (url: string) => void;
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
}

const FileUploadInput = ({ accept, onChange, label, placeholder, value, disabled }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isUploading}
        />
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={disabled || isUploading}
        />
        <Button
          variant="outline"
          size="icon"
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default function DeepfakeGeneratorPage() {
  const [initImage, setInitImage] = useState<string>('');
  const [targetImage, setTargetImage] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [initVideo, setInitVideo] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [options, setOptions] = useState<GenerationOptions>(defaultOptions);
  const [activeTab, setActiveTab] = useState('single_face');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<string>();

  const handleGenerate = async () => {
    // Validate inputs based on operation type
    if (activeTab === 'single_face' || activeTab === 'multiple_face') {
      if (!initImage || !targetImage) {
        toast.error('Please provide both initial and target images');
        return;
      }
    } else if (activeTab === 'single_video') {
      if (!initVideo || !targetImage) {
        toast.error('Please provide both initial video and target image');
        return;
      }
    } else if (activeTab === 'specific_video') {
      if (!initVideo || !targetImage || !referenceImage) {
        toast.error('Please provide initial video, target image, and reference image');
        return;
      }
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedOutput(null);
    setCountdown(60); // Start 60 second countdown
    
    // Clear any existing toasts
    if (loadingToastId) toast.dismiss(loadingToastId);
    setLoadingToastId(toast.loading('Processing... 60 seconds remaining'));

    try {
      // Map tab names to API operations
      const operationMap = {
        single_face: 'single_face_swap',
        multiple_face: 'multiple_face_swap',
        single_video: 'single_video_swap',
        specific_video: 'specific_video_swap'
      };

      const operation = operationMap[activeTab as keyof typeof operationMap];

      // Prepare request body based on operation
      const requestBody: any = {
        operation,
        ...options
      };

      if (activeTab === 'single_face' || activeTab === 'multiple_face') {
        requestBody.init_image = initImage;
        requestBody.target_image = targetImage;
        if (activeTab === 'single_face' && referenceImage) {
          requestBody.reference_image = referenceImage;
        }
      } else {
        requestBody.init_video = initVideo;
        requestBody.target_image = targetImage;
        if (activeTab === 'specific_video') {
          requestBody.reference_image = referenceImage;
        }
      }

      const response = await fetch('/api/deepfake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      if (data.status === 'processing' && data.fetchUrl) {
        // Start polling the fetch URL
        let attempts = 0;
        const maxAttempts = 30;
        const pollInterval = 2000; // 2 seconds

        const pollResult = async () => {
          if (attempts >= maxAttempts) {
            setCountdown(null);
            toast.dismiss(loadingToastId);
            throw new Error('Timeout waiting for processing');
          }

          try {
            const pollResponse = await fetch(data.fetchUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            const pollData = await pollResponse.json();

            if (pollData.status === 'success' && pollData.output && pollData.output.length > 0) {
              setCountdown(null);
              toast.dismiss(loadingToastId);
              setGeneratedOutput(pollData.output[0]);
              setInferenceTime(pollData.generationTime);
              toast.success('Processing completed successfully!');
              setIsGenerating(false);
              return;
            }

            if (pollData.status === 'failed' || pollData.status === 'error') {
              setCountdown(null);
              toast.dismiss(loadingToastId);
              throw new Error(pollData.message || 'Processing failed');
            }

            // Still processing, try again after delay
            attempts++;
            setTimeout(pollResult, pollInterval);
          } catch (err: unknown) {
            console.error('Polling error:', err);
            setCountdown(null);
            toast.dismiss(loadingToastId);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            toast.error(err instanceof Error ? err.message : 'Unknown error occurred');
            setIsGenerating(false);
          }
        };

        // Start polling
        setTimeout(pollResult, pollInterval);
      } else if (data.status === 'success' && data.output) {
        setCountdown(null);
        toast.dismiss(loadingToastId);
        setGeneratedOutput(data.output);
        setInferenceTime(data.generationTime);
        toast.success('Processing completed successfully!');
        setIsGenerating(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: unknown) {
      console.error('Processing error:', err);
      setCountdown(null);
      toast.dismiss(loadingToastId);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">AI Deepfake Studio</CardTitle>
              <CardDescription>
                Create stunning face swaps in images and videos using advanced AI technology.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="single_face">Single Face</TabsTrigger>
              <TabsTrigger value="multiple_face">Multiple Faces</TabsTrigger>
              <TabsTrigger value="single_video">Video Swap</TabsTrigger>
              <TabsTrigger value="specific_video">Specific Video</TabsTrigger>
            </TabsList>

            <TabsContent value="single_face" className="space-y-4">
              <FileUploadInput
                accept="image/*"
                onChange={setInitImage}
                label="Initial Image (with face to replace)"
                placeholder="Enter URL or upload image..."
                value={initImage}
                disabled={isGenerating}
              />
              <FileUploadInput
                accept="image/*"
                onChange={setTargetImage}
                label="Target Image (with face to use)"
                placeholder="Enter URL or upload image..."
                value={targetImage}
                disabled={isGenerating}
              />
              <FileUploadInput
                accept="image/*"
                onChange={setReferenceImage}
                label="Reference Image (Optional)"
                placeholder="Enter URL or upload image..."
                value={referenceImage}
                disabled={isGenerating}
              />
            </TabsContent>

            <TabsContent value="multiple_face" className="space-y-4">
              <FileUploadInput
                accept="image/*"
                onChange={setInitImage}
                label="Initial Image (with faces to replace)"
                placeholder="Enter URL or upload image..."
                value={initImage}
                disabled={isGenerating}
              />
              <FileUploadInput
                accept="image/*"
                onChange={setTargetImage}
                label="Target Image (with faces to use)"
                placeholder="Enter URL or upload image..."
                value={targetImage}
                disabled={isGenerating}
              />
            </TabsContent>

            <TabsContent value="single_video" className="space-y-4">
              <FileUploadInput
                accept="video/*"
                onChange={setInitVideo}
                label="Initial Video"
                placeholder="Enter URL or upload video..."
                value={initVideo}
                disabled={isGenerating}
              />
              <FileUploadInput
                accept="image/*"
                onChange={setTargetImage}
                label="Target Image (with face to use)"
                placeholder="Enter URL or upload image..."
                value={targetImage}
                disabled={isGenerating}
              />
            </TabsContent>

            <TabsContent value="specific_video" className="space-y-4">
              <FileUploadInput
                accept="video/*"
                onChange={setInitVideo}
                label="Initial Video"
                placeholder="Enter URL or upload video..."
                value={initVideo}
                disabled={isGenerating}
              />
              <FileUploadInput
                accept="image/*"
                onChange={setTargetImage}
                label="Target Image (with face to use)"
                placeholder="Enter URL or upload image..."
                value={targetImage}
                disabled={isGenerating}
              />
              <FileUploadInput
                accept="image/*"
                onChange={setReferenceImage}
                label="Reference Image"
                placeholder="Enter URL or upload image..."
                value={referenceImage}
                disabled={isGenerating}
              />
            </TabsContent>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Switch
              checked={options.watermark}
              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, watermark: checked }))}
              disabled={isGenerating}
            />
            <Label>Add Watermark</Label>
          </div>

          {generatedOutput && (
            <div className="space-y-2">
              <Label>Generated Output</Label>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="aspect-video mb-4 flex items-center justify-center">
                  {activeTab.includes('video') ? (
                    <video
                      ref={videoRef}
                      src={generatedOutput}
                      controls
                      loop
                      autoPlay
                      muted
                      playsInline
                      className="max-w-full max-h-[600px] rounded-lg"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={generatedOutput}
                        alt="Generated output"
                        className="max-w-full max-h-[600px] rounded-lg"
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.onerror = null;
                          setError('Failed to load the generated output. You can still download it using the button below.');
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm truncate flex-1 mr-4">
                    {generatedOutput}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generatedOutput, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                {inferenceTime && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Generated in {inferenceTime.toFixed(2)} seconds
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {activeTab.includes('video') ? (
                  <Video className="mr-2 h-4 w-4" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
                )}
                Start Processing
              </>
            )}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  );
}
