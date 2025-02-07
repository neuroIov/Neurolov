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
    const apiKey = process.env.NEXT_PUBLIC_MODELSLAB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const modelLabsBody = {
      key: apiKey,
      prompt: body.prompt,
      negative_prompt: body.negative_prompt || "",
      width: body.width || 512,
      height: body.height || 512,
      samples: body.num_samples || 1,
      safety_checker: body.safety_checker !== false,
      instant_response: false,
      base64: false,
      enhance_prompt: body.enhance_prompt || false,
      enhance_style: body.enhance_style || null
    };

    console.log('Sending request to ModelsLab:', { ...modelLabsBody, key: '***' });

    const modelLabsResponse = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modelLabsBody)
    });

    const data = await modelLabsResponse.json();
    console.log('ModelsLab Response:', data);

    if (!modelLabsResponse.ok) {
      return NextResponse.json({ error: data.error || 'Failed to generate image' }, { status: modelLabsResponse.status });
    }

    // Return the response with images array
    return NextResponse.json({ 
      images: data.output || [],
      message: 'Image generated successfully', 
      provider: 'modelslab'
    });

  } catch (error) {
    console.error('Error in image generation:', error);
    return errorResponse(error.message || 'Failed to generate image', 500);
  }
}
