
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import UnifiedDropCard from '@/components/UnifiedDropCard';

interface Drop {
  id: string;
  song_title: string;
  artist_name: string;
  spotify_url: string;
  caption?: string;
  created_at: string;
  user_id: string;
  mood_id: string;
  mood_ids?: string[];
  profiles?: {
    username: string;
    avatar_url?: string;
  };
  moods?: {
    name: string;
    emoji: string;
  };
}

const DropDetails = () => {
  const { dropId } = useParams<{ dropId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: drop, isLoading, error } = useQuery({
    queryKey: ['drop', dropId],
    queryFn: async () => {
      if (!dropId) throw new Error('Drop ID is required');
      
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .eq('id', dropId)
        .single();
      
      if (error) throw error;
      return data as Drop;
    },
    enabled: !!dropId,
  });

  const { data: votes = [] } = useQuery({
    queryKey: ['drop-votes', dropId],
    queryFn: async () => {
      if (!dropId) return [];
      
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type, user_id')
        .eq('drop_id', dropId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!dropId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-purple-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading drop...</span>
        </div>
      </div>
    );
  }

  if (error || !drop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-8 text-center max-w-md">
          <CardContent>
            <h2 className="text-xl font-bold text-white mb-4">Drop Not Found</h2>
            <p className="text-gray-400 mb-4">
              The drop you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate('/home')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20">
      <div className={cn("container mx-auto py-6 max-w-4xl", isMobile ? "px-2" : "px-4")}>
        {/* Header with back button */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className={cn("font-bold text-white", isMobile ? "text-xl" : "text-2xl")}>
            Drop Details
          </h1>
        </div>

        {/* Drop Card */}
        <div className="space-y-6">
          <UnifiedDropCard
            drop={drop}
            votes={votes.map(v => ({
              vote_type: v.vote_type as 'fire' | 'down' | 'chill',
              user_id: v.user_id
            }))}
            onVote={() => {
              // Optionally refetch votes or handle vote updates
            }}
            showFollowButton={true}
          />

          {/* Additional Details Section */}
          <Card className="bg-gradient-to-br from-gray-900/80 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Drop Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Song</label>
                  <p className="text-white">{drop.song_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Artist</label>
                  <p className="text-white">{drop.artist_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Posted by</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={drop.profiles?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs">
                        {drop.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white">@{drop.profiles?.username || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Posted</label>
                  <p className="text-white">{formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}</p>
                </div>
                {drop.moods && (
                  <div>
                    <label className="text-sm font-medium text-gray-300">Mood</label>
                    <div className="mt-1">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                        {drop.moods.emoji} {drop.moods.name}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DropDetails;
