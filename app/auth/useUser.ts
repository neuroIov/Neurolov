'use client';

import { useEffect, useState } from 'react';
import { User, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for all auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          setUser(session?.user ?? null);
          break;
        case 'SIGNED_OUT':

          setUser(null);
          break;
        default:
          // For events like 'PASSWORD_RECOVERY', 'USER_UPDATED' etc.
          if (session?.user) {
            setUser(session.user);
          }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
  };
}
