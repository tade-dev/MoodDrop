
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Flame, Moon, MoreHorizontal, Play, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface EnhancedDropCardProps {
  drop: {
    id: string;
    spotify_url: string;
    artist_name: string;
    song_title: string;
    caption?: string;
    created_at: string;
    user_id: string;
    mood_id: string;
    profiles?: {
      username: string;
      avatar_url?: string;
    };
    moods?: {
      name: string;
      emoji: string;
    };
  };
  votes?: Array<{
    vote_type: 'fire' | 'down' | 'chill';
    user_id: string;
  }>;
  onVote?: () => void;
}

const EnhancedDropCard = ({ drop, votes = [], onVote }: EnhancedDropCardProps) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getSpotifyEmbedUrl = (url: string) => {
    const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    const playlistMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
    
    if (trackMatch) {
      return `https://open.spotify.com/embed/track/${trackMatch[1]}`;
    } else if (playlistMatch) {
      return `https://open.spotify.com/embed/playlist/${playlistMatch[1]}`;
    }
    return null;
  };

  const handleVote = async (voteType: 'fire' | 'down' | 'chill') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote on drops",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(true);
    try {
      const existingVote = votes.find(v => v.user_id === user.id);
      
      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('votes')
            .delete()
            .eq('drop_id', drop.id)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('drop_id', drop.id)
            .eq('user_id', user.id);
        }
      } else {
        await supabase
          .from('votes')
          .insert({
            drop_id: drop.id,
            user_id: user.id,
            vote_type: voteType
          });
      }
      
      onVote?.();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getVoteCount = (voteType: 'fire' | 'down' | 'chill') => {
    return votes.filter(v => v.vote_type === voteType).length;
  };

  const hasUserVoted = (voteType: 'fire' | 'down' | 'chill') => {
    return user && votes.some(v => v.user_id === user.id && v.vote_type === voteType);
  };

  const embedUrl = getSpotifyEmbedUrl(drop.spotify_url);
  const timeAgo = new Date(drop.created_at).toLocaleDateString();

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-black/60 via-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-white/10 hover:border-purple-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Mood color accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-purple-400/30 ring-offset-2 ring-offset-black/20">
              <AvatarImage src={drop.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
                {drop.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-white">{drop.profiles?.username || 'Anonymous'}</p>
                <span className="text-2xl animate-pulse">{drop.moods?.emoji}</span>
              </div>
              <p className="text-sm text-gray-400">{drop.moods?.name}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Song Info */}
        <div className="mb-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg leading-tight mb-1">{drop.song_title}</h3>
              <p className="text-purple-300 font-medium">{drop.artist_name}</p>
              {drop.caption && (
                <p className="text-gray-300 mt-2 text-sm italic">"{drop.caption}"</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="ml-3 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:scale-110 transition-all duration-300"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
          </div>
        </div>

        {/* Spotify Embed */}
        {embedUrl && (
          <div className="mb-4 rounded-xl overflow-hidden shadow-xl ring-1 ring-white/10">
            <iframe
              src={embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
            />
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('fire')}
              disabled={isVoting}
              className={`group/btn flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 ${
                hasUserVoted('fire') 
                  ? 'bg-orange-500/20 text-orange-300 shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/50' 
                  : 'text-gray-400 hover:text-orange-300 hover:bg-orange-400/10'
              }`}
            >
              <Flame className={`w-4 h-4 ${hasUserVoted('fire') ? 'animate-bounce' : 'group-hover/btn:animate-pulse'}`} />
              <span className="text-sm font-medium">{getVoteCount('fire')}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('down')}
              disabled={isVoting}
              className={`group/btn flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 ${
                hasUserVoted('down') 
                  ? 'bg-red-500/20 text-red-300 shadow-lg shadow-red-500/20 ring-1 ring-red-400/50' 
                  : 'text-gray-400 hover:text-red-300 hover:bg-red-400/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasUserVoted('down') ? 'animate-pulse' : 'group-hover/btn:animate-pulse'}`} />
              <span className="text-sm font-medium">{getVoteCount('down')}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('chill')}
              disabled={isVoting}
              className={`group/btn flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 ${
                hasUserVoted('chill') 
                  ? 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400/50' 
                  : 'text-gray-400 hover:text-blue-300 hover:bg-blue-400/10'
              }`}
            >
              <Moon className={`w-4 h-4 ${hasUserVoted('chill') ? 'animate-spin-slow' : 'group-hover/btn:animate-pulse'}`} />
              <span className="text-sm font-medium">{getVoteCount('chill')}</span>
            </Button>
          </div>
          
          <p className="text-gray-500 text-xs font-medium bg-white/5 px-3 py-1 rounded-full">
            {timeAgo}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedDropCard;
