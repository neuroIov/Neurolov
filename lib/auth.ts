import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getUserFromRequest() {
  const supabase = createServerComponentClient({
    cookies,
  });

  const { data } = await supabase.auth.getUser();

  return data.user || null;
}
