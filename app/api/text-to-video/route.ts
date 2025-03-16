import { NextRequest, NextResponse } from 'next/server';

// Helper function to ensure we always return JSON
const errorResponse = (message: string, status: number = 500, details: any = null) => {
  return new NextResponse(
    JSON.stringify({
      error: message,
      details: details
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

// Helper function to poll the fetch result URL
async function pollFetchResult(fetchUrl: string, maxAttempts: number = 30, delayMs: number = 2000): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();

      if (data.status === 'success' && data.output && data.output.length > 0) {
        return data;
      }

      if (data.status === 'failed' || data.status === 'error') {
        throw new Error(data.message || 'Generation failed');
      }

      // If still processing, wait and try again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error('Error polling fetch result:', error);
      throw error;
    }
  }

  throw new Error('Timeout waiting for video generation');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get API key from environment variable
    const modelslabApiKey = process.env.NEXT_PUBLIC_MODELSLAB_API_KEY;

    if (!modelslabApiKey) {
      console.error('ModelsLab API key not found in environment variables');
      return errorResponse('ModelsLab API key not configured', 500);
    }

    if (!body.prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const modelLabsBody = {
      key: modelslabApiKey,
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || '',
      model_name: body.model_name || 'stable_video_diffusion',
      width: body.width || 1024,
      height: body.height || 576,
      num_frames: body.num_frames || 25,
      motion_bucket_id: body.motion_bucket_id || 127,
      fps: body.fps || 6,
      seed: body.seed || 0,
      num_inference_steps: body.num_inference_steps || 25,
      guidance_scale: body.guidance_scale || 25.0,
      webhook: null,
      track_id: null
    };

    // Initial request to start video generation
    try {
      console.log('Sending video generation request:', modelLabsBody);
      const modelLabsResponse = await fetch('https://modelslab.com/api/v6/video/text2video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelLabsBody)
      });

      if (!modelLabsResponse.ok) {
        throw new Error(`HTTP error! status: ${modelLabsResponse.status}`);
      }

      const initialData = await modelLabsResponse.json();
      console.log('ModelsLab Response:', initialData);

      // If processing, return the fetch URL
      if (initialData.status === 'processing' && initialData.fetch_result) {
        return NextResponse.json({
          status: 'processing',
          fetchUrl: initialData.fetch_result,
          eta: initialData.eta || 30,
          id: initialData.id,
          meta: initialData.meta,
          futureLinks: initialData.future_links || []
        });
      }

      // If immediate success (unlikely), return the result
      if (initialData.status === 'success' && initialData.output && initialData.output.length > 0) {
        return NextResponse.json({
          status: 'success',
          videoUrl: initialData.output[0],
          proxyUrl: initialData.proxy_links?.[0] || initialData.output[0],
          generationTime: initialData.generationTime,
          id: initialData.id,
          meta: initialData.meta
        });
      }

      throw new Error('Invalid response format from ModelsLab API');
    } catch (error: any) {
      console.error('Video generation error:', error);
      return errorResponse(error.message || 'Failed to generate video', 500);
    }
  } catch (error: any) {
    console.error('Request processing error:', error);
    return errorResponse('Failed to process request', 400);
  }
}
