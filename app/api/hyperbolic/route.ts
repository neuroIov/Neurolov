import { NextResponse } from 'next/server';

const HYPERBOLIC_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJuaXRpc2htZXN3YWxAZ21haWwuY29tIiwiaWF0IjoxNzM2NDk4Mzk5fQ.NvMvtg6JrPCIl43h6KP7rDp5n5PedKS2LdjGNnQQiM8';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const url = 'https://api.hyperbolic.xyz/v1/image/generation';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`
      },
      body: JSON.stringify({
        model_name: 'FLUX.1-dev',
        prompt: body.prompt.trim(),
        steps: 30,
        cfg_scale: 5,
        enable_refiner: false,
        height: 1024,
        width: 1024,
        backend: 'auto'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Hyperbolic API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}