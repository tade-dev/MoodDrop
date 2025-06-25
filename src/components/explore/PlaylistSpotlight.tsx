
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Heart, Users, Plus, UserPlus } from 'lucide-react';

const PlaylistSpotlight = () => {
  const { data: playlists, isLoading } = useQuery({
    queryKey: ['featured-playlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          moods(name, emoji),
          profiles(username, avatar_url)
        `)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="min-w-[320px] h-64 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {playlists?.map((playlist) => (
          <CarouselItem key={playlist.id} className="pl-2 md:pl-4 basis-auto">
            <Card className="min-w-[320px] bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 cursor-pointer group">
              <CardContent className="p-6">
                {/* Cover Art */}
                <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4 flex items-center justify-center relative overflow-hidden">
                  {playlist.cover_art_url ? (
                    <img 
                      src={playlist.cover_art_url} 
                      alt={playlist.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-6xl opacity-50">🎵</div>
                  )}
                  
                  {/* Collaboration badge */}
                  {playlist.is_collab && (
                    <Badge className="absolute top-2 left-2 bg-green-500/20 text-green-300 border-green-400/30">
                      <UserPlus className="w-3 h-3 mr-1" />
                      Collab
                    </Badge>
                  )}
                  
                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button size="sm" className="bg-white/20 hover:bg-white/30">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                      <Plus className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Playlist Info */}
                <div>
                  <h3 className="font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                    {playlist.title}
                  </h3>
                  
                  {playlist.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {playlist.moods && (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                          {playlist.moods.emoji} {playlist.moods.name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Users className="w-3 h-3" />
                      <span>{playlist.follower_count}</span>
                    </div>
                  </div>

                  {/* Collaborators */}
                  {playlist.is_collab && playlist.contributors && playlist.contributors.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">Collaborators:</span>
                      <div className="flex -space-x-2">
                        {playlist.contributors.slice(0, 3).map((contributorId, index) => (
                          <Avatar key={contributorId} className="w-6 h-6 border-2 border-black">
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs">
                              {index + 1}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {playlist.contributors.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-black flex items-center justify-center">
                            <span className="text-xs text-white">+{playlist.contributors.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    by @{playlist.profiles?.username}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
      <CarouselNext className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
    </Carousel>
  );
};

export default PlaylistSpotlight;
