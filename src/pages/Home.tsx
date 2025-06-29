
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Flame, TrendingUp, Users, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import UnifiedDropCard from '@/components/UnifiedDropCard';
import WeeklyChallengeBanner from '@/components/WeeklyChallengeBanner';
import TrendingMoodsCarousel from '@/components/explore/TrendingMoodsCarousel';

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

interface HotDrop {
  id: string;
  song_title: string;
  artist_name: string;
  spotify_url: string;
  caption: string;
  mood_name: string;
  mood_emoji: string;
  username: string;
  vote_count: number;
  created_at: string;
  user_id: string;
  mood_id: string;
}

interface Vote {
  vote_type: 'fire' | 'down' | 'chill';
  user_id: string;
}

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('for-you');

  // Infinite query for For You feed
  const {
    data: forYouData,
    fetchNextPage: fetchNextForYou,
    hasNextPage: hasNextForYou,
    isFetchingNextPage: isFetchingNextForYou,
    isLoading: isLoadingForYou,
    refetch: refetchForYou
  } = useInfiniteQuery({
    queryKey: ['drops-for-you-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .order('created_at', { ascending: false })
        .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE - 1);
      
      if (error) throw error;
      return { data: data as Drop[], nextPage: data.length === ITEMS_PER_PAGE ? pageParam + 1 : null };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
  });

  // Fetch votes for all drops
  const allDrops = forYouData?.pages?.flatMap(page => page.data) || [];
  const { data: votesData = [] } = useQuery({
    queryKey: ['votes', allDrops.map(d => d.id)],
    queryFn: async () => {
      if (allDrops.length === 0) return [];
      
      const { data, error } = await supabase
        .from('votes')
        .select('drop_id, vote_type, user_id')
        .in('drop_id', allDrops.map(d => d.id));
      
      if (error) throw error;
      return data || [];
    },
    enabled: allDrops.length > 0,
  });

  // Fetch trending drops (hot drops)
  const { data: hotDropsData = [], isLoading: isLoadingHot } = useQuery({
    queryKey: ['hot-drops'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_hot_drops', {
        hours_back: 24,
        result_limit: 20
      });
      
      if (error) throw error;
      return data as HotDrop[];
    },
    enabled: !!user,
  });

  // Transform hot drops to match Drop interface
  const hotDrops: Drop[] = hotDropsData.map(drop => ({
    id: drop.id,
    song_title: drop.song_title,
    artist_name: drop.artist_name,
    spotify_url: drop.spotify_url,
    caption: drop.caption,
    created_at: drop.created_at,
    user_id: drop.user_id || '',
    mood_id: drop.mood_id || '',
    profiles: {
      username: drop.username,
    },
    moods: {
      name: drop.mood_name,
      emoji: drop.mood_emoji,
    }
  }));

  // Fetch following feed
  const { data: followingDrops = [], isLoading: isLoadingFollowing } = useQuery({
    queryKey: ['following-drops'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: followsData } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id);

      const followedIds = followsData?.map(f => f.followed_id) || [];
      
      if (followedIds.length === 0) return [];

      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Drop[];
    },
    enabled: !!user,
  });

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (activeTab !== 'for-you') return;
    
    if (
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 1000 &&
      hasNextForYou &&
      !isFetchingNextForYou
    ) {
      fetchNextForYou();
    }
  }, [activeTab, hasNextForYou, isFetchingNextForYou, fetchNextForYou]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const getDropVotes = (dropId: string): Vote[] => {
    return votesData
      .filter(vote => vote.drop_id === dropId)
      .filter(vote => ['fire', 'down', 'chill'].includes(vote.vote_type))
      .map(vote => ({
        vote_type: vote.vote_type as 'fire' | 'down' | 'chill',
        user_id: vote.user_id
      }));
  };

  const renderDrops = (drops: Drop[], isLoading: boolean, showInfiniteScroll = false) => {
    if (isLoading && drops.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      );
    }

    if (!drops || drops.length === 0) {
      return (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">No drops found</div>
            <p className="text-sm text-gray-500">Follow some users or check out trending drops!</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {drops.map((drop) => (
          <UnifiedDropCard
            key={drop.id}
            drop={drop}
            votes={getDropVotes(drop.id)}
            onVote={() => refetchForYou()}
          />
        ))}
        
        {showInfiniteScroll && isFetchingNextForYou && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-2" />
            <span className="text-gray-400">Loading more drops...</span>
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to MoodDrop</h2>
            <p className="text-gray-400">Please sign in to see your personalized feed</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20">
      <div className={cn("container mx-auto py-6 max-w-4xl", isMobile ? "px-2" : "px-4")}>
        {/* Weekly Challenge Banner */}
        <WeeklyChallengeBanner />
        
        {/* Trending Moods */}
        <div className="mb-8">
          <h2 className={cn("font-bold text-white mb-4", isMobile ? "text-lg px-2" : "text-xl")}>
            Trending Moods
          </h2>
          <TrendingMoodsCarousel />
        </div>

        {/* Main Feed */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/40 backdrop-blur-lg border border-white/10">
            <TabsTrigger value="for-you" className="data-[state=active]:bg-purple-600">
              <Flame className="w-4 h-4" />
              {!isMobile && <span className="ml-2">For You</span>}
              {isMobile && <span className="text-xs">For You</span>}
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Trending</span>}
              {isMobile && <span className="text-xs">Trending</span>}
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4" />
              {!isMobile && <span className="ml-2">Following</span>}
              {isMobile && <span className="text-xs">Following</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="for-you" className="space-y-6">
            <div className={cn("flex items-center justify-between", isMobile && "px-2")}>
              <h2 className={cn("font-bold text-white", isMobile ? "text-xl" : "text-2xl")}>
                Your Feed
              </h2>
            </div>
            {renderDrops(allDrops, isLoadingForYou, true)}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className={cn("flex items-center justify-between", isMobile && "px-2")}>
              <h2 className={cn("font-bold text-white", isMobile ? "text-xl" : "text-2xl")}>
                Trending Now
              </h2>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            </div>
            {renderDrops(hotDrops || [], isLoadingHot)}
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className={cn("flex items-center justify-between", isMobile && "px-2")}>
              <h2 className={cn("font-bold text-white", isMobile ? "text-xl" : "text-2xl")}>
                Following
              </h2>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Users className="w-3 h-3 mr-1" />
                {followingDrops.length} drops
              </Badge>
            </div>
            {renderDrops(followingDrops || [], isLoadingFollowing)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
