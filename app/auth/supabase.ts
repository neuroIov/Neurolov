import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let lastAuthAttempt = 0;
const MIN_AUTH_INTERVAL = 2000; // Minimum 2 seconds between auth attempts

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClientComponentClient();
  }
  return supabase;
};

// Rate limiting check
const checkRateLimit = () => {
  const now = Date.now();
  if (now - lastAuthAttempt < MIN_AUTH_INTERVAL) {
    throw new Error('Please wait before trying to sign in again');
  }
  lastAuthAttempt = now;
};

// Browser detection helpers
const isInstagramBrowser = () => /Instagram/.test(window.navigator.userAgent);
const isIOSDevice = () => /iPhone|iPad|iPod/.test(window.navigator.userAgent);
const isAndroidDevice = () => /Android/.test(window.navigator.userAgent);

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  try {
    checkRateLimit();
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.status === 429) {
        throw new Error('Too many sign-in attempts. Please wait a few minutes and try again.');
      }
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Email sign in error:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'An error occurred during sign in',
        status: error.status || 500
      }
    };
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    checkRateLimit();
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      if (error.status === 429) {
        throw new Error('Too many sign-up attempts. Please wait a few minutes and try again.');
      }
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Email sign up error:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'An error occurred during sign up',
        status: error.status || 500
      }
    };
  }
};

// OAuth provider auth helper
export const signInWithProvider = async (provider: 'google' | 'github') => {
  try {
    // Check rate limit
    checkRateLimit();

    // Only redirect to external browser if we're in Instagram's in-app browser
    if (isInstagramBrowser()) {
      const currentUrl = window.location.href;
      
      if (isIOSDevice()) {
        // For iOS Instagram, try Chrome first then Safari
        window.location.href = `googlechromes://${currentUrl}`;
        setTimeout(() => {
          window.location.href = `safari-https://${currentUrl.replace('https://', '')}`;
        }, 2000);
      } else if (isAndroidDevice()) {
        // For Android Instagram
        window.location.href = `intent://${currentUrl.replace('https://', '')}#Intent;scheme=https;package=com.android.chrome;end`;
      }
      
      return { error: null };
    }

    // For all other browsers (including iOS Safari), proceed with normal OAuth
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // Add a timestamp to prevent caching issues on iOS
          _t: Date.now().toString()
        }
      },
    });

    if (error) {
      // Handle rate limit errors specifically
      if (error.status === 429) {
        throw new Error('Too many sign-in attempts. Please wait a few minutes and try again.');
      }
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { 
      data: null, 
      error: {
        message: error.message || 'An error occurred during sign in',
        status: error.status || 500
      }
    };
  }
};



// Sign out helper
export const signOut = async () => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { 
      error: {
        message: error.message || 'An error occurred during sign out',
        status: error.status || 500
      }
    };
  }
};
