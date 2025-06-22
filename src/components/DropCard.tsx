
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Flame, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface DropCardProps {
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
    vote_type: 'fire' | 'heartbreak' | 'chill';
    user_id: string;
  }>;
  onVote?: () => void;
}

const DropCard = ({ drop, votes = [], onVote }: DropCardProps) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);

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

  const handleVote = async (voteType: 'fire' | 'heartbreak' | 'chill') => {
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
          // Remove vote if same type
          await supabase
            .from('votes')
            .delete()
            .eq('drop_id', drop.id)
            .eq('user_id', user.id);
        } else {
          // Update vote type
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('drop_id', drop.id)
            .eq('user_id', user.id);
        }
      } else {
        // Create new vote
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

  const getVoteCount = (voteType: 'fire' | 'heartbreak' | 'chill') => {
    return votes.filter(v => v.vote_type === voteType).length;
  };

  const hasUserVoted = (voteType: 'fire' | 'heartbreak' | 'chill') => {
    return user && votes.some(v => v.user_id === user.id && v.vote_type === voteType);
  };

  const embedUrl = getSpotifyEmbedUrl(drop.spotify_url);

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-white/10 overflow-hidden">
      <div className="p-6">
        {/* User info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={drop.profiles?.avatar_url} />
            <AvatarFallback className="bg-purple-600 text-white">
              {drop.profiles?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-white">{drop.profiles?.username || 'Anonymous'}</p>
              <span className="text-2xl">{drop.moods?.emoji}</span>
            </div>
            <p className="text-gray-400 text-sm">{drop.moods?.name}</p>
          </div>
        </div>

        {/* Song info */}
        <div className="mb-4">
          <h3 className="font-bold text-white text-lg">{drop.song_title}</h3>
          <p className="text-gray-300">{drop.artist_name}</p>
          {drop.caption && (
            <p className="text-gray-400 mt-2">{drop.caption}</p>
          )}
        </div>

        {/* Spotify embed */}
        {embedUrl && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <iframe
              src={embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        )}

        {/* Vote buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('fire')}
              disabled={isVoting}
              className={`text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 ${
                hasUserVoted('fire') ? 'bg-orange-400/20' : ''
              }`}
            >
              <Flame className="w-4 h-4 mr-1" />
              {getVoteCount('fire')}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('heartbreak')}
              disabled={isVoting}
              className={`text-red-400 hover:text-red-300 hover:bg-red-400/10 ${
                hasUserVoted('heartbreak') ? 'bg-red-400/20' : ''
              }`}
            >
              <Heart className="w-4 h-4 mr-1" />
              {getVoteCount('heartbreak')}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('chill')}
              disabled={isVoting}
              className={`text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 ${
                hasUserVoted('chill') ? 'bg-blue-400/20' : ''
              }`}
            >
              <Moon className="w-4 h-4 mr-1" />
              {getVoteCount('chill')}
            </Button>
          </div>
          
          <p className="text-gray-500 text-sm">
            {new Date(drop.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DropCard;
