import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/hooks/useUser';

export interface ModelLike {
  model_id: string;
  like_count: number;
  is_liked_by_user: boolean;
}

export const useLikes = (modelId: string) => {
  const [likeCount, setLikeCount] = useState<number>(7869);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { user } = useUser();

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get like count
        const { data: likeData } = await supabase
          .from('model_like_counts')
          .select('like_count')
          .eq('model_id', modelId)
          .single();

        // Get user's like status
        const { data: userLike } = await supabase
          .from('model_likes')
          .select('*')
          .eq('model_id', modelId)
          .eq('user_id', user.id)
          .single();

        if (likeData) {
          setLikeCount(likeData.like_count);
        }
        setIsLiked(!!userLike);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching like status:', error);
        setIsLoading(false);
      }
    };

    // Set up real-time subscription for like count updates
    const subscription = supabase
      .channel(`model_likes:${modelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'model_like_counts',
          filter: `model_id=eq.${modelId}`
        },
        (payload: any) => {
          if (payload.new) {
            setLikeCount(payload.new.like_count);
          }
        }
      )
      .subscribe();

    fetchLikeStatus();

    return () => {
      subscription.unsubscribe();
    };
  }, [modelId, user, supabase]);

  const toggleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('model_likes')
          .delete()
          .eq('model_id', modelId)
          .eq('user_id', user.id);
        
        setIsLiked(false);
      } else {
        await supabase
          .from('model_likes')
          .insert({
            model_id: modelId,
            user_id: user.id,
          });
        
        setIsLiked(true);
      }
      
      // Fetch updated like count after toggle
      const { data: likeData } = await supabase
        .from('model_like_counts')
        .select('like_count')
        .eq('model_id', modelId)
        .single();

      if (likeData) {
        setLikeCount(likeData.like_count);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return {
    likeCount,
    isLiked,
    isLoading,
    toggleLike
  };
};