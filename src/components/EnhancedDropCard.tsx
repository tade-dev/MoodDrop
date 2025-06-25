
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Music
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import VoteButton from '@/components/VoteButton';
import BookmarkButton from '@/components/BookmarkButton';
import DropActionsMenu from '@/components/DropActionsMenu';
import VibeThreads from '@/components/VibeThreads';
import SpotifyPlayer from '@/components/SpotifyPlayer';

interface Drop {
  id: string;
  spotify_url: string;
  artist_name: string;
  song_title: string;
  caption?: string;
  created_at: string;
  user_id: string;
  mood_id: string;
  mood_ids?: string[];
  drop_type?: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
  moods?: {
    name: string;
    emoji: string;
  };
  challenge_winner?: boolean;
}

interface Vote {
  vote_type: 'up' | 'down' | 'fire' | 'chill';
  user_id: string;
}

interface EnhancedDropCardProps {
  drop: Drop;
  votes: Vote[];
  onVote: () => void;
  onDropDeleted?: () => void;
}

const EnhancedDropCard = ({ drop, votes, onVote, onDropDeleted }: EnhancedDropCardProps) => {
  const { user } = useAuth();
  const [commentCount, setCommentCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [dropMoods, setDropMoods] = useState<any[]>([]);

  // Calculate vote counts - treating 'up' and 'fire' as upvotes, 'down' and 'chill' as downvotes
  const upvotes = votes.filter(vote => vote.vote_type === 'up' || vote.vote_type === 'fire').length;
  const downvotes = votes.filter(vote => vote.vote_type === 'down' || vote.vote_type === 'chill').length;
  const userVote = votes.find(vote => vote.user_id === user?.id);

  // Fetch moods if drop has mood_ids array
  useEffect(() => {
    const fetchDropMoods = async () => {
      if (drop.mood_ids && drop.mood_ids.length > 0) {
        const { data, error } = await supabase
          .from('moods')
          .select('id, name, emoji')
          .in('id', drop.mood_ids);
        
        if (!error && data) {
          setDropMoods(data);
        }
      } else if (drop.moods) {
        // Fallback to single mood for backward compatibility
        setDropMoods([drop.moods]);
      }
    };

    fetchDropMoods();
  }, [drop.mood_ids, drop.moods]);

  // Check if drop is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('drop_id', drop.id)
        .single();
      
      setIsBookmarked(!!data);
    };

    checkBookmarkStatus();
  }, [user?.id, drop.id]);

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  const handleBookmarkChange = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${drop.song_title} by ${drop.artist_name}`,
          text: drop.caption || `Check out this song on MoodDrop!`,
          url: drop.spotify_url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(drop.spotify_url);
        // You could add a toast notification here
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden mx-2 sm:mx-0">
      <div className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-purple-400/30">
              <AvatarImage src={drop.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold">
                {drop.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm sm:text-base">
                @{drop.profiles?.username || 'Unknown'}
              </p>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                <span>{formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <DropActionsMenu 
            dropId={drop.id}
            userId={drop.user_id}
            onDropDeleted={onDropDeleted}
          />
        </div>

        {/* Multiple Mood Badges */}
        {dropMoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dropMoods.map((mood) => (
              <Badge 
                key={mood.id}
                variant="secondary" 
                className="bg-purple-500/20 text-purple-300 border-purple-400/30 text-xs px-2 py-1"
              >
                {mood.emoji} {mood.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Caption */}
        {drop.caption && (
          <div className="text-white text-sm sm:text-base leading-relaxed">
            {drop.caption}
          </div>
        )}

        {/* Spotify Player */}
        <SpotifyPlayer
          spotifyUrl={drop.spotify_url}
          songTitle={drop.song_title}
          artistName={drop.artist_name}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <VoteButton
              dropId={drop.id}
              currentVote={userVote}
              upvotes={upvotes}
              downvotes={downvotes}
              onVote={onVote}
            />
            
            <VibeThreads
              dropId={drop.id}
              commentCount={commentCount}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 text-xs sm:text-sm text-gray-400 hover:text-green-300 hover:bg-green-400/10"
            >
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            
            <BookmarkButton 
              dropId={drop.id}
              isBookmarked={isBookmarked}
              onBookmarkChange={handleBookmarkChange}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedDropCard;
