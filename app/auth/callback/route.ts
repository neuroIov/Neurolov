import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Auth callback initiated');
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/dashboard';

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

      // Exchange code for session
      console.log('Exchanging code for session...');
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      console.log('Session exchange result:', sessionError ? 'Error' : 'Success');
      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        throw sessionError;
      }

      // Get the user after exchange
      console.log('Getting user data...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User data result:', userError ? 'Error' : 'Success', user?.email);
      if (userError) {
        console.error('Get user error:', userError);
        throw userError;
      }

      if (user) {
        // Ensure profile exists
        console.log('Checking for existing profile...');
        console.log('Checking/creating profile for user:', user.id);
        
        // First try to get the profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) {
          console.log('No profile found, creating one...');
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                email: user.email,
                updated_at: new Date().toISOString(),
              },
            ], { onConflict: 'id' });
          
          if (insertError) {
            console.error('Profile creation error:', insertError);
            // Don't throw the error, just log it and continue
            console.log('Continuing despite profile error...');
          } else {
            console.log('Profile created successfully');
          }
        } else {
          console.log('Existing profile found');
        }

        // Successful authentication, redirect to dashboard
        console.log('Authentication successful, redirecting to:', next);
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
