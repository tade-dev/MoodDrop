
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Flame, TrendingUp, Users, ChevronDown } from 'lucide-react';
import EnhancedDropCard from '@/components/EnhancedDropCard';
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

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you');
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch paginated drops for For You feed
  const { data: forYouData, isLoading: isLoadingForYou } = useQuery({
    queryKey: ['drops-for-you', currentPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .order('created_at', { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);
      
      if (error) throw error;
      return data as Drop[];
    },
    enabled: !!user,
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
      
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .in('user_id', 
          await supabase
            .from('follows')
            .select('followed_id')
            .eq('follower_id', user.id)
            .then(({ data }) => data?.map(f => f.followed_id) || [])
        )
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Drop[];
    },
    enabled: !!user,
  });

  const loadMoreDrops = () => {
    setCurrentPage(prev => prev + 1);
  };

  const renderDrops = (drops: Drop[], isLoading: boolean) => {
    if (isLoading) {
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
          <EnhancedDropCard
            key={drop.id}
            drop={drop}
            votes={[]}
            onVote={() => {}}
            className="bg-gradient-to-br from-purple-900/10 via-pink-900/5 to-blue-900/10 backdrop-blur-sm border border-white/10"
          />
        ))}
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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Weekly Challenge Banner */}
        <WeeklyChallengeBanner />
        
        {/* Trending Moods */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Trending Moods</h2>
          <TrendingMoodsCarousel />
        </div>

        {/* Main Feed */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-lg border border-white/10">
            <TabsTrigger value="for-you" className="data-[state=active]:bg-purple-600 flex items-center space-x-2">
              <Flame className="w-4 h-4" />
              <span>For You</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-purple-600 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Following</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="for-you" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Feed</h2>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                Page {currentPage + 1}
              </Badge>
            </div>
            {renderDrops(forYouData || [], isLoadingForYou)}
            
            {forYouData && forYouData.length >= ITEMS_PER_PAGE && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={loadMoreDrops}
                  variant="outline"
                  className="bg-black/20 border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Load More Drops
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Trending Now</h2>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            </div>
            {renderDrops(hotDrops || [], isLoadingHot)}
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Following</h2>
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
