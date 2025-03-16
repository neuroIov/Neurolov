import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function for error responses
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

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return errorResponse('OpenAI API key not configured', 500);
    }

    if (!body.messages || !Array.isArray(body.messages)) {
      return errorResponse('Messages array is required', 400);
    }

    try {
      // Call OpenAI chat API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: body.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: body.max_tokens || 2000,
        temperature: 0.8,  // Slightly increased for more creative responses
        top_p: 1,
        presence_penalty: 0.1,  // Slight penalty to avoid repetitive responses
        frequency_penalty: 0.1,  // Slight penalty to encourage diverse vocabulary
      });

      const message = completion.choices[0]?.message?.content;

      if (message) {
        return NextResponse.json({
          status: 'success',
          message: message,
          meta: {
            usage: completion.usage,
            messages: body.messages.concat([{
              role: 'assistant',
              content: message
            }])
          }
        });
      }

      throw new Error('No response from OpenAI API');
    } catch (error: any) {
      console.error('Chat error:', error);
      return errorResponse(error.message || 'Failed to get chat response', 500);
    }
  } catch (error: any) {
    console.error('Request processing error:', error);
    return errorResponse('Failed to process request', 400);
  }
}
