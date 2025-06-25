
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface TrendingMoodData {
  mood_id: string;
  mood_name: string;
  mood_emoji: string;
  drop_count: number;
}

const TrendingMoods = () => {
  const { data: trendingMoods, isLoading } = useQuery({
    queryKey: ['trending-moods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drops')
        .select(`
          mood_id,
          moods!inner(name, emoji)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Count occurrences of each mood
      const moodCounts = data.reduce((acc: Record<string, TrendingMoodData>, drop) => {
        const moodId = drop.mood_id;
        const moodName = drop.moods.name;
        const moodEmoji = drop.moods.emoji;
        
        if (!acc[moodId]) {
          acc[moodId] = {
            mood_id: moodId,
            mood_name: moodName,
            mood_emoji: moodEmoji,
            drop_count: 0
          };
        }
        acc[moodId].drop_count++;
        return acc;
      }, {});

      return Object.values(moodCounts)
        .sort((a, b) => b.drop_count - a.drop_count)
        .slice(0, 6);
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!trendingMoods?.length) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No trending moods this week</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {trendingMoods.map((mood, index) => (
        <Card
          key={mood.mood_id}
          className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
        >
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2">{mood.mood_emoji}</div>
            <h3 className="font-bold text-white mb-1 group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              {mood.mood_name}
            </h3>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
              {mood.drop_count} drops
            </Badge>
            {index < 3 && (
              <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs">
                #{index + 1}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TrendingMoods;
