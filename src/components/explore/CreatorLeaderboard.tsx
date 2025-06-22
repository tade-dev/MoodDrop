
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Crown, Award, Medal } from 'lucide-react';
import FollowButton from '@/components/FollowButton';
import { useAuth } from '@/contexts/AuthContext';

const CreatorLeaderboard = () => {
  const { user } = useAuth();
  const [followStates, setFollowStates] = useState<{ [key: string]: boolean }>({});

  const { data: creators, isLoading, refetch } = useQuery({
    queryKey: ['creator-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_leaderboard')
        .select('*')
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (user && creators) {
      checkFollowStates();
    }
  }, [user, creators]);

  const checkFollowStates = async () => {
    if (!user || !creators) return;
    
    const creatorIds = creators.map(creator => creator.id);
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id)
        .in('followed_id', creatorIds);

      if (!error && data) {
        const followedIds = data.reduce((acc, follow) => {
          acc[follow.followed_id] = true;
          return acc;
        }, {} as { [key: string]: boolean });
        
        setFollowStates(followedIds);
      }
    } catch (error) {
      console.error('Error checking follow states:', error);
    }
  };

  const handleFollowChange = () => {
    checkFollowStates();
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Medal className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRankBorder = (index: number) => {
    switch (index) {
      case 0:
        return 'border-yellow-400/50 bg-gradient-to-r from-yellow-900/20 to-amber-900/20';
      case 1:
        return 'border-gray-300/50 bg-gradient-to-r from-gray-800/20 to-slate-800/20';
      case 2:
        return 'border-amber-600/50 bg-gradient-to-r from-amber-900/20 to-orange-900/20';
      default:
        return 'border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {creators?.map((creator, index) => (
        <Card
          key={creator.id}
          className={`${getRankBorder(index)} backdrop-blur-sm border transition-all duration-500 hover:scale-105 cursor-pointer group`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center gap-2 min-w-[60px]">
                  {getRankIcon(index)}
                  <span className="text-white font-bold text-lg">#{index + 1}</span>
                </div>

                {/* Avatar */}
                <Avatar className="w-12 h-12 ring-2 ring-purple-400/30">
                  <AvatarImage src={creator.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                    {creator.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* Creator Info */}
                <div>
                  <h3 className="font-bold text-white group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                    @{creator.username}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {creator.upvote_count} total upvotes
                  </p>
                </div>
              </div>

              {/* Follow Button */}
              <FollowButton
                targetUserId={creator.id}
                isFollowing={followStates[creator.id] || false}
                onFollowChange={handleFollowChange}
                username={creator.username}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CreatorLeaderboard;
