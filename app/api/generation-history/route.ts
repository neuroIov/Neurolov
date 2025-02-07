import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js'

// Define the session type
interface Session {
  user?: {
    id: string;
    email?: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get user's generation history
export async function GET(req: NextRequest) {
  try {
    // Get the session from cookies instead of next-auth
    const sessionCookie = cookies().get('session');
    const session: Session | null = sessionCookie ? JSON.parse(sessionCookie.value) : null;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: history, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('timestamp', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching generation history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generation history' },
      { status: 500 }
    )
  }
}

// Save new generation
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = cookies().get('session');
    const session: Session | null = sessionCookie ? JSON.parse(sessionCookie.value) : null;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { prompt, style, width, height, guidance, imageUrl } = body

    const { data: generation, error } = await supabase
      .from('generation_history')
      .insert([
        {
          user_id: session.user.id,
          prompt,
          style,
          width,
          height,
          guidance,
          image_url: imageUrl,
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(generation)
  } catch (error) {
    console.error('Error saving generation:', error)
    return NextResponse.json(
      { error: 'Failed to save generation' },
      { status: 500 }
    )
  }
}
