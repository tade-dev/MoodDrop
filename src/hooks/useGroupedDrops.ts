
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GroupedDrop {
  group_id: string;
  spotify_url: string;
  song_title: string;
  artist_name: string;
  caption: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string;
  moods: Array<{
    id: string;
    name: string;
    emoji: string;
    drop_id: string;
  }>;
  total_votes: number;
  total_comments: number;
  drop_ids: string[];
}

export const useGroupedDrops = (moodFilter?: string) => {
  return useQuery({
    queryKey: ['grouped-drops', moodFilter],
    queryFn: async () => {
      console.log('Fetching grouped drops with mood filter:', moodFilter);
      
      const { data, error } = await supabase.rpc('get_grouped_drops_feed', {
        page_limit: 20,
        page_offset: 0,
        mood_filter: moodFilter || null
      });

      if (error) {
        console.error('Error fetching grouped drops:', error);
        throw error;
      }

      console.log('Grouped drops data:', data);
      return data as GroupedDrop[];
    },
  });
};
