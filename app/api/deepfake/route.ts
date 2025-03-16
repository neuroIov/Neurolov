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

    // Validate required fields based on operation type
    const { operation } = body;
    if (!operation) {
      return errorResponse('Operation type is required', 400);
    }

    // Prepare request body with API key
    const requestBody = {
      key: modelslabApiKey,
      ...body
    };

    delete requestBody.operation; // Remove operation from body as it's not needed in API call

    // Determine endpoint based on operation
    let endpoint;
    switch (operation) {
      case 'single_face_swap':
        if (!body.init_image || !body.target_image) {
          return errorResponse('Initial and target images are required for single face swap', 400);
        }
        endpoint = 'single_face_swap';
        break;
      case 'multiple_face_swap':
        if (!body.init_image || !body.target_image) {
          return errorResponse('Initial and target images are required for multiple face swap', 400);
        }
        endpoint = 'multiple_face_swap';
        break;
      case 'single_video_swap':
        if (!body.init_video || !body.target_image) {
          return errorResponse('Initial video and target image are required for video face swap', 400);
        }
        endpoint = 'single_video_swap';
        break;
      case 'specific_video_swap':
        if (!body.init_video || !body.target_image || !body.reference_image) {
          return errorResponse('Initial video, target image, and reference image are required for specific video swap', 400);
        }
        endpoint = 'specific_video_swap';
        break;
      default:
        return errorResponse('Invalid operation type', 400);
    }

    // Make request to ModelsLab API
    try {
      console.log('Making request to ModelsLab API:', endpoint);
      const modelLabsResponse = await fetch(`https://modelslab.com/api/v6/deepfake/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!modelLabsResponse.ok) {
        throw new Error(`HTTP error! status: ${modelLabsResponse.status}`);
      }

      const data = await modelLabsResponse.json();
      console.log('ModelsLab Response:', data);

      // If processing, return the fetch URL
      if (data.status === 'processing' && data.fetch_result) {
        return NextResponse.json({
          status: 'processing',
          fetchUrl: data.fetch_result,
          eta: data.eta || 30,
          id: data.id,
          meta: data.meta,
          futureLinks: data.future_links || []
        });
      }

      // If immediate success, return the result
      if (data.status === 'success' && data.output && data.output.length > 0) {
        return NextResponse.json({
          status: 'success',
          output: data.output[0],
          proxyUrl: data.proxy_links?.[0] || data.output[0],
          generationTime: data.generationTime,
          id: data.id,
          meta: data.meta
        });
      }

      throw new Error('Invalid response format from ModelsLab API');
    } catch (error: any) {
      console.error('ModelsLab API error:', error);
      return errorResponse(error.message || 'Failed to process request', 500);
    }
  } catch (error: any) {
    console.error('Request processing error:', error);
    return errorResponse('Failed to process request', 400);
  }
}
