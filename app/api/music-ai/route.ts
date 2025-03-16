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

// Helper function to poll for results
async function pollForResults(fetchUrl: string, apiKey: string, maxAttempts = 30, delayMs = 2000): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`Polling attempt ${attempt + 1}/${maxAttempts}`);
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: apiKey })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Poll response:', {
        status: data.status,
        hasOutput: !!data.output,
        outputLength: data.output?.length,
        eta: data.eta
      });

      if (data.status === 'success' && data.output && data.output.length > 0) {
        return data;
      } else if (data.status === 'failed' || data.status === 'error') {
        throw new Error(data.message || 'Generation failed');
      } else if (data.future_links && data.future_links.length > 0) {
        // If we have future_links but no output yet, construct the response
        return {
          status: 'success',
          output: data.future_links,
          generationTime: data.audio_time || 0,
          id: data.id
        };
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error('Polling error:', error);
      // Only throw if it's the last attempt
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      // Otherwise wait and try again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Timeout waiting for music generation. Please try again.');
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
      init_audio: body.init_audio || undefined,
      sampling_rate: body.sampling_rate || 32000,
      max_new_token: body.max_new_token || 512,
      base64: body.base64 || false,
      temp: body.temp || false,
      webhook: body.webhook || null,
      track_id: body.track_id || null
    };

    // Try ModelsLab music generation
    try {
      console.log('Attempting ModelsLab music generation with prompt:', body.prompt);
      const modelLabsResponse = await fetch('https://modelslab.com/api/v6/voice/music_gen', {
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

      // Log response status and data structure
      console.log('ModelsLab Response Status:', modelLabsResponse.status);
      console.log('ModelsLab Response Structure:', Object.keys(initialData));

      // If we have future_links immediately, use those
      if (initialData.future_links && initialData.future_links.length > 0) {
        return NextResponse.json({ 
          audio: initialData.future_links,
          message: 'Music generated successfully', 
          provider: 'modelslab',
          generationTime: initialData.audio_time || 0,
          id: initialData.id
        });
      }

      // If processing, poll for results
      if (initialData.status === 'processing' && initialData.fetch_result) {
        console.log('Generation in progress, polling for results...');
        const finalData = await pollForResults(initialData.fetch_result, modelslabApiKey);
        
        return NextResponse.json({ 
          audio: finalData.output,
          message: 'Music generated successfully', 
          provider: 'modelslab',
          generationTime: finalData.generationTime,
          id: finalData.id
        });
      }

      // If immediate success
      if (initialData.status === 'success' && initialData.output && initialData.output.length > 0) {
        return NextResponse.json({ 
          audio: initialData.output,
          message: 'Music generated successfully', 
          provider: 'modelslab',
          generationTime: initialData.generationTime,
          id: initialData.id
        });
      }

      throw new Error('Invalid response format from ModelsLab API');
    } catch (error: any) {
      console.error('Music generation error:', error);
      return errorResponse(error.message || 'Failed to generate music', 500);
    }
  } catch (error: any) {
    console.error('Request processing error:', error);
    return errorResponse('Failed to process request', 400);
  }
}
