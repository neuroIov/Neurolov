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

      const data = await modelLabsResponse.json();

      // Log response status and data structure
      console.log('ModelsLab Response Status:', modelLabsResponse.status);
      console.log('ModelsLab Response Structure:', Object.keys(data));

      if (!modelLabsResponse.ok) {
        console.error('ModelsLab API Error:', data);
        throw new Error(data.error || data.message || `API returned status ${modelLabsResponse.status}`);
      }

      if (!data.output || !Array.isArray(data.output) || data.output.length === 0) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from ModelsLab API');
      }

      return NextResponse.json({ 
        audio: data.output,
        message: 'Music generated successfully', 
        provider: 'modelslab',
        generationTime: data.generationTime,
        id: data.id
      });
    } catch (error: any) {
      console.error('Music generation error:', error);
      return errorResponse(error.message || 'Failed to generate music', 500);
    }
  } catch (error: any) {
    console.error('Request processing error:', error);
    return errorResponse('Failed to process request', 400);
  }
}
