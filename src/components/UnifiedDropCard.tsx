
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Heart, 
  Moon,
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  ExternalLink,
  Copy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import SpotifyPlayer from '@/components/SpotifyPlayer';
import FollowButton from '@/components/FollowButton';
import BookmarkButton from '@/components/BookmarkButton';
import DropActionsMenu from '@/components/DropActionsMenu';
import VibeThreads from '@/components/VibeThreads';

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
  vote_type: 'fire' | 'down' | 'chill';
  user_id: string;
}

interface UnifiedDropCardProps {
  drop: Drop;
  votes?: Vote[];
  onVote?: () => void;
  onDropDeleted?: () => void;
  showFollowButton?: boolean;
}

const UnifiedDropCard = ({ 
  drop, 
  votes = [], 
  onVote, 
  onDropDeleted,
  showFollowButton = true 
}: UnifiedDropCardProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isVoting, setIsVoting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dropMoods, setDropMoods] = useState<any[]>([]);

  // Fetch moods if drop has mood_ids array
  useEffect(() => {
    const fetchDropMoods = async () => {
      console.log('Fetching moods for drop:', drop.id, 'mood_ids:', drop.mood_ids);
      
      if (drop.mood_ids && drop.mood_ids.length > 0) {
        const { data, error } = await supabase
          .from('moods')
          .select('id, name, emoji')
          .in('id', drop.mood_ids);
        
        if (!error && data) {
          setDropMoods(data);
        }
      } else if (drop.mood_id) {
        const { data, error } = await supabase
          .from('moods')
          .select('id, name, emoji')
          .eq('id', drop.mood_id)
          .single();
        
        if (!error && data) {
          setDropMoods([data]);
        }
      } else if (drop.moods) {
        setDropMoods([drop.moods]);
      }
    };

    fetchDropMoods();
  }, [drop.mood_ids, drop.mood_id, drop.moods, drop.id]);

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

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !showFollowButton || drop.user_id === user.id) return;
      
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('followed_id', drop.user_id)
        .single();
      
      setIsFollowing(!!data);
    };

    checkFollowStatus();
  }, [user?.id, drop.user_id, showFollowButton]);

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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/drop/${drop.id}`;
    const shareText = `Check out "${drop.song_title}" by ${drop.artist_name} on MoodDrop!`;
    
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: `${drop.song_title} by ${drop.artist_name}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Drop link has been copied to your clipboard",
        });
      } catch (error) {
        console.log('Error copying to clipboard:', error);
        toast({
          title: "Share",
          description: shareText,
        });
      }
    }
  };

  const getVoteCount = (voteType: 'fire' | 'down' | 'chill') => {
    return votes.filter(v => v.vote_type === voteType).length;
  };

  const hasUserVoted = (voteType: 'fire' | 'down' | 'chill') => {
    return user && votes.some(v => v.user_id === user.id && v.vote_type === voteType);
  };

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  const handleBookmarkChange = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Card className={cn(
      "bg-gradient-to-br from-gray-900/80 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden",
      isMobile ? "mx-2" : "mx-0"
    )}>
      <div className={cn("space-y-4", isMobile ? "p-4" : "p-6")}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className={cn("ring-2 ring-purple-400/30", isMobile ? "w-10 h-10" : "w-12 h-12")}>
              <AvatarImage src={drop.profiles?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold">
                {drop.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={cn("font-semibold text-white truncate", isMobile ? "text-sm" : "text-base")}>
                @{drop.profiles?.username || 'Unknown'}
              </p>
              <div className={cn("flex items-center space-x-2 text-gray-400", isMobile ? "text-xs" : "text-sm")}>
                <span>{formatDistanceToNow(new Date(drop.created_at), { addSuffix: true })}</span>
              </div>
              
              {/* Show follow button on mobile */}
              {isMobile && showFollowButton && drop.user_id !== user?.id && (
                <div className="mt-2">
                  <FollowButton
                    targetUserId={drop.user_id}
                    isFollowing={isFollowing}
                    onFollowChange={() => setIsFollowing(!isFollowing)}
                    username={drop.profiles?.username}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Desktop follow button */}
            {!isMobile && showFollowButton && drop.user_id !== user?.id && (
              <FollowButton
                targetUserId={drop.user_id}
                isFollowing={isFollowing}
                onFollowChange={() => setIsFollowing(!isFollowing)}
                username={drop.profiles?.username}
              />
            )}
            
            <DropActionsMenu 
              dropId={drop.id}
              userId={drop.user_id}
              onDropDeleted={onDropDeleted}
            />
          </div>
        </div>

        {/* Multiple Mood Badges */}
        {dropMoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dropMoods.map((mood, index) => (
              <Badge 
                key={mood.id || index}
                variant="secondary" 
                className={cn(
                  "bg-purple-500/20 text-purple-300 border-purple-400/30",
                  isMobile ? "text-xs px-2 py-1" : "text-sm px-3 py-1"
                )}
              >
                {mood.emoji} {mood.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Caption */}
        {drop.caption && (
          <div className={cn("text-white leading-relaxed", isMobile ? "text-sm" : "text-base")}>
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
          <div className={cn("flex items-center", isMobile ? "space-x-1" : "space-x-2")}>
            {/* Fire Vote */}
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={() => handleVote('fire')}
              disabled={isVoting}
              className={cn(
                "text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 transition-all duration-300 hover:scale-110",
                hasUserVoted('fire') ? 'bg-orange-400/20' : '',
                isMobile ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
              )}
            >
              <Flame className={cn(isMobile ? "w-3 h-3" : "w-4 h-4", "mr-1")} />
              {getVoteCount('fire')}
            </Button>
            
            {/* Heart Vote */}
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={() => handleVote('down')}
              disabled={isVoting}
              className={cn(
                "text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-300 hover:scale-110",
                hasUserVoted('down') ? 'bg-red-400/20' : '',
                isMobile ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
              )}
            >
              <Heart className={cn(isMobile ? "w-3 h-3" : "w-4 h-4", "mr-1")} />
              {getVoteCount('down')}
            </Button>
            
            {/* Moon Vote */}
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={() => handleVote('chill')}
              disabled={isVoting}
              className={cn(
                "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-all duration-300 hover:scale-110",
                hasUserVoted('chill') ? 'bg-blue-400/20' : '',
                isMobile ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm"
              )}
            >
              <Moon className={cn(isMobile ? "w-3 h-3" : "w-4 h-4", "mr-1")} />
              {getVoteCount('chill')}
            </Button>

            {/* Comments */}
            <VibeThreads
              dropId={drop.id}
              commentCount={commentCount}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>

          <div className={cn("flex items-center", isMobile ? "space-x-1" : "space-x-2")}>
            {/* Share Button */}
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={handleShare}
              className={cn(
                "text-gray-400 hover:text-green-300 hover:bg-green-400/10 transition-all duration-300 hover:scale-110",
                isMobile ? "px-2 py-1" : "px-3 py-2"
              )}
            >
              <Share2 className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
            </Button>
            
            {/* Bookmark */}
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

export default UnifiedDropCard;
