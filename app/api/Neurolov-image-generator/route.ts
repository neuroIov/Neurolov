import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { checkAndUpdateUsage } from '@/lib/usageLimiter';

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
    const user = await getUserFromRequest();

if (!user) {
  return new NextResponse(
    JSON.stringify({ error: 'Unauthorized. Please log in.' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

const usage = await checkAndUpdateUsage(user.id, 'image');

if (!usage.allowed) {
  return new NextResponse(
    JSON.stringify({ error: `Daily image generation limit reached (${usage.limit}/day).` }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  );
}

    // Get API keys from environment variables
    const modelslabApiKey = process.env.NEXT_PUBLIC_MODELSLAB_API_KEY;
    const stabilityApiKey = process.env.STABILITY_API_KEY;
    const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;

    if (!modelslabApiKey) {
      return NextResponse.json({ error: 'ModelsLab API key not configured' }, { status: 500 });
    }

    const modelLabsBody = {
      key: modelslabApiKey,
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

    // Try ModelsLab first
    try {
      console.log('Attempting ModelsLab generation:', { ...modelLabsBody, key: '***' });
      const modelLabsResponse = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelLabsBody)
      });

      const data = await modelLabsResponse.json();
      console.log('ModelsLab Response:', data);

      // If we have processing status with ETA, we need to wait regardless of future_links
      if (data.status === "processing" && data.eta) {
        const waitTime = data.eta * 1000; // Convert to milliseconds
        console.log(`Image processing, ETA: ${data.eta} seconds. Waiting before returning image URLs...`);
        
        // Wait for the ETA time
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // After waiting, if we have future_links, use those
        if (data.future_links && data.future_links.length > 0) {
          console.log('Using future_links after waiting for ETA:', data.future_links);
          return NextResponse.json({ 
            images: data.future_links,
            message: 'Image generated successfully', 
            provider: 'modelslab',
            generationTime: data.generationTime || 0,
            metadata: data.meta || {}
          });
        }
        
        // If we have fetch_result URL, try to get the result
        if (data.fetch_result) {
          console.log(`Fetching result from: ${data.fetch_result}`);
          
          try {
            // Fetch the result after waiting
            const resultResponse = await fetch(data.fetch_result, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            const resultData = await resultResponse.json();
            console.log('Result after waiting for ETA:', resultData);
            
            if (resultData.status === "success" && resultData.output && resultData.output.length > 0) {
              return NextResponse.json({ 
                images: resultData.output,
                message: 'Image generated successfully', 
                provider: 'modelslab',
                generationTime: resultData.generationTime || 0,
                metadata: resultData.meta || data.meta || {}
              });
            }
          } catch (error) {
            console.error('Error fetching result:', error);
            // If fetch fails but we have future_links, use those as fallback
            if (data.future_links && data.future_links.length > 0) {
              console.log('Fetch failed, falling back to future_links:', data.future_links);
              return NextResponse.json({ 
                images: data.future_links,
                message: 'Image generated successfully (fallback)', 
                provider: 'modelslab',
                generationTime: data.generationTime || 0,
                metadata: data.meta || {}
              });
            }
          }
        }
      }

      // If immediate success with output
      if (modelLabsResponse.ok && data.output && data.output.length > 0) {
        return NextResponse.json({ 
          images: data.output,
          message: 'Image generated successfully', 
          provider: 'modelslab'
        });
      }
      
      throw new Error(data.error || data.message || 'ModelsLab generation failed');
    } catch (modelLabsError) {
      console.warn('ModelsLab failed, trying Stability AI:', modelLabsError);

      // Try Stability AI as first fallback
      if (stabilityApiKey) {
        try {
          const stabilityResponse = await fetch(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${stabilityApiKey}`,
              },
              body: JSON.stringify({
                text_prompts: [
                  {
                    text: body.prompt,
                    weight: 1
                  },
                  ...(body.negative_prompt ? [{
                    text: body.negative_prompt,
                    weight: -1
                  }] : [])
                ],
                cfg_scale: 7,
                height: body.height || 1024,
                width: body.width || 1024,
                samples: body.num_samples || 1,
                steps: 50,
              }),
            }
          );

          if (!stabilityResponse.ok) {
            const error = await stabilityResponse.json();
            throw new Error(error.message || 'Stability AI generation failed');
          }

          const result = await stabilityResponse.json();
          const images = result.artifacts.map((artifact: any) => 
            `data:image/png;base64,${artifact.base64}`
          );

          return NextResponse.json({
            images,
            message: 'Image generated successfully using Stability AI fallback',
            provider: 'stability'
          });
        } catch (stabilityError) {
          console.warn('Stability AI failed, trying Hugging Face:', stabilityError);
        }
      }

      // Try Hugging Face as final fallback
      if (!huggingfaceApiKey) {
        throw new Error('No available fallback services');
      }

      // Function to sleep for specified milliseconds
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Retry function for Hugging Face API
      const retryHuggingFace = async (maxRetries = 5, initialDelay = 2000) => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
          try {
            const huggingFaceResponse = await fetch(
              "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
              {
                headers: { 
                  Authorization: `Bearer ${huggingfaceApiKey}`,
                  'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                  inputs: body.prompt,
                  parameters: {
                    negative_prompt: body.negative_prompt,
                    width: body.width || 512,
                    height: body.height || 512,
                    num_inference_steps: 50,
                    num_outputs: body.num_samples || 1,
                  }
                }),
              }
            );

            if (huggingFaceResponse.status === 503) {
              const error = await huggingFaceResponse.json();
              if (error.error?.includes('loading')) {
                console.log(`Model still loading, attempt ${i + 1}/${maxRetries}. Waiting before retry...`);
                await sleep(initialDelay * Math.pow(2, i)); // Exponential backoff
                continue;
              }
            }

            if (!huggingFaceResponse.ok) {
              const error = await huggingFaceResponse.json();
              throw new Error(error.error || 'Hugging Face generation failed');
            }

            const imageBlob = await huggingFaceResponse.blob();
            const base64Image = Buffer.from(await imageBlob.arrayBuffer()).toString('base64');
            return [`data:image/jpeg;base64,${base64Image}`];
          } catch (error) {
            lastError = error;
            if (!error.message?.includes('loading')) {
              throw error; // If it's not a loading error, throw immediately
            }
            await sleep(initialDelay * Math.pow(2, i));
          }
        }
        throw lastError || new Error('Max retries reached for Hugging Face API');
      };

      // Try to generate image with retries
      const images = await retryHuggingFace();
      
      return NextResponse.json({ 
        images,
        message: 'Image generated successfully using Hugging Face fallback', 
        provider: 'huggingface'
      });
    }
  } catch (error) {
    console.error('Error in image generation:', error);
    return errorResponse(error.message || 'Failed to generate image', 500);
  }
}