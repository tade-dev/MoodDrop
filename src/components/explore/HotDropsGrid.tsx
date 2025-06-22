
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Zap, ThumbsUp, Play } from 'lucide-react';
import { getSpotifyEmbedUrl } from '@/utils/spotifyHelpers';

interface HotDropsGridProps {
  timeFilter: string;
  sortFilter: string;
}

const HotDropsGrid = ({ timeFilter, sortFilter }: HotDropsGridProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const hoursBack = timeFilter === '24h' ? 24 : timeFilter === '7d' ? 168 : 24;

  const { data: hotDrops, isLoading } = useQuery({
    queryKey: ['hot-drops', timeFilter, sortFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_hot_drops', {
        hours_back: hoursBack,
        result_limit: 20
      });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {hotDrops?.map((drop) => (
        <Card
          key={drop.id}
          className="break-inside-avoid bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-500 cursor-pointer group overflow-hidden"
          onMouseEnter={() => setExpandedCard(drop.id)}
          onMouseLeave={() => setExpandedCard(null)}
        >
          <CardContent className="p-0">
            {/* Spotify Embed */}
            <div className="aspect-square relative overflow-hidden rounded-t-xl">
              <iframe
                src={getSpotifyEmbedUrl(drop.spotify_url)}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-t-xl"
              />
              
              {/* Overlay with info - shows on hover/expanded */}
              <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-between transition-all duration-500 ${
                expandedCard === drop.id ? 'opacity-100' : 'opacity-0'
              }`}>
                <div>
                  <Badge className="mb-2 bg-purple-500/20 text-purple-300 border-purple-400/30">
                    {drop.mood_emoji} {drop.mood_name}
                  </Badge>
                  <h3 className="font-bold text-white text-sm mb-1">{drop.song_title}</h3>
                  <p className="text-gray-300 text-xs mb-2">{drop.artist_name}</p>
                  {drop.caption && (
                    <p className="text-gray-400 text-xs line-clamp-2">{drop.caption}</p>
                  )}
                </div>
                
                {/* Vote buttons */}
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 p-2">
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-2">
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300 hover:bg-green-500/20 p-2">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Bottom info - always visible */}
            <div className="p-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>@{drop.username}</span>
                <span>{drop.vote_count} votes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HotDropsGrid;
