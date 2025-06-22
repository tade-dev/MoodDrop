import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, ThumbsUp, Play, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getSpotifyEmbedUrl } from '@/utils/spotifyHelpers';

interface HotDropsGridProps {
  timeFilter: string;
  sortFilter: string;
}

const HotDropsGrid = ({ timeFilter, sortFilter }: HotDropsGridProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const hoursBack = timeFilter === '24h' ? 24 : timeFilter === '7d' ? 168 : 24;

  const { data: hotDrops, isLoading } = useQuery({
    queryKey: ['hot-drops', timeFilter, sortFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_hot_drops', {
        hours_back: hoursBack,
        result_limit: 10
      });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {hotDrops?.map((drop) => (
        <Card
          key={drop.id}
          className="group relative overflow-hidden bg-gradient-to-br from-black/60 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
          onMouseEnter={() => setHoveredCard(drop.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-0">
            {/* Spotify Embed */}
            <div className="aspect-square relative overflow-hidden">
              <iframe
                src={getSpotifyEmbedUrl(drop.spotify_url)}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-t-xl"
              />
              
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="space-y-2">
                  {/* Mood badge */}
                  <Badge className="bg-purple-500/30 border-purple-400/50 text-purple-200 text-xs">
                    {drop.mood_emoji} {drop.mood_name}
                  </Badge>
                  
                  {/* Song info */}
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{drop.song_title}</h3>
                    <p className="text-gray-300 text-xs line-clamp-1">{drop.artist_name}</p>
                  </div>
                  
                  {/* User info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          <User className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-400 text-xs">@{drop.username}</span>
                    </div>
                    <span className="text-purple-300 text-xs font-medium">{drop.vote_count} votes</span>
                  </div>
                </div>
              </div>
              
              {/* Hover actions */}
              <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-300 ${
                hoveredCard === drop.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-black/50 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-full">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-black/50 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 rounded-full">
                  <Zap className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-black/50 hover:bg-green-500/30 text-green-400 hover:text-green-300 rounded-full">
                  <ThumbsUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HotDropsGrid;
