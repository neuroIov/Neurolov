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

    if (!body.messages || !Array.isArray(body.messages)) {
      return errorResponse('Messages array is required', 400);
    }

    const modelLabsBody = {
      key: modelslabApiKey,
      messages: body.messages,
      max_tokens: body.max_tokens || 1000,
      temperature: 1,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      track_id: null,
      webhook: null
    };

    // Call ModelsLab uncensored chat API
    try {
      console.log('Sending chat request with messages:', body.messages);
      const modelLabsResponse = await fetch('https://modelslab.com/api/v6/llm/uncensored_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelLabsBody)
      });

      if (!modelLabsResponse.ok) {
        throw new Error(`HTTP error! status: ${modelLabsResponse.status}`);
      }

      const data = await modelLabsResponse.json();
      console.log('ModelsLab Response:', data);

      // Handle error response from ModelsLab
      if (data.status === 'error') {
        return errorResponse(data.message || 'ModelsLab API error', 500);
      }

      if (data.status === 'success' && data.message) {
        // Return both the message and meta information
        return NextResponse.json({
          status: 'success',
          message: data.message,
          meta: {
            ...data.meta,
            messages: body.messages.concat([{
              role: 'assistant',
              content: data.message
            }])
          }
        });
      }

      throw new Error('Invalid response format from ModelsLab API');
    } catch (error: any) {
      console.error('Chat error:', error);
      return errorResponse(error.message || 'Failed to get chat response', 500);
    }
  } catch (error: any) {
    console.error('Request processing error:', error);
    return errorResponse('Failed to process request', 400);
  }
}
