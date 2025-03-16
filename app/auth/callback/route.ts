import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/dashboard';

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // Exchange code for session
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        throw sessionError;
      }

      // Get the user after exchange
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Get user error:', userError);
        throw userError;
      }

      if (user) {
        // Ensure profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }

        if (!profile) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata.full_name || '',
                avatar_url: user.user_metadata.avatar_url || '',
                email: user.email,
              },
            ]);
          
          if (insertError) {
            console.error('Profile creation error:', insertError);
            throw insertError;
          }
        }

        // Successful authentication, redirect to dashboard
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    }

    // If we get here, something went wrong
    throw new Error('Authentication failed');
  } catch (error) {
    console.error('Auth callback error:', error);
    // Redirect to login page with error
    const errorUrl = new URL('/', request.url);
    errorUrl.searchParams.set('error', 'Authentication failed');
    return NextResponse.redirect(errorUrl);
  }
}
