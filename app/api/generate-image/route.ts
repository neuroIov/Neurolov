import { NextResponse } from 'next/server';

const MODAL_API_URL = process.env.MODAL_API_URL;
const MODAL_API_KEY = process.env.MODAL_API_KEY;

export async function POST(req: Request) {
  try {
    const { prompt, style, count = 1 } = await req.json();

    if (!MODAL_API_URL || !MODAL_API_KEY) {
      return NextResponse.json(
        { error: 'Modal Labs API configuration is missing' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await fetch(MODAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MODAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        style,
        num_images: count,
        width: 1024,
        height: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Modal Labs API error: ${error}`);
    }

    const data = await response.json();
    return NextResponse.json({ images: data.images });
  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    );
  }
}
