import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LIMITS = {
  chat: 10,
  image: 3
};

export async function checkAndUpdateUsage(userId: string, feature: 'chat' | 'image') {
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from('daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('date', today)
    .single();

  const used = existing?.count || 0;
  const limit = LIMITS[feature];

  if (used >= limit) {
    return { allowed: false, limit };
  }

  if (existing) {
    await supabase
      .from('daily_usage')
      .update({ count: used + 1 })
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('date', today);
  } else {
    await supabase
      .from('daily_usage')
      .insert([{ user_id: userId, feature, date: today, count: 1 }]);
  }

  return { allowed: true, limit };
}
