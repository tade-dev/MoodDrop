
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Target } from 'lucide-react';

interface Challenge {
  id: string;
  prompt: string;
  mood_id: string;
  mood_name: string;
  mood_emoji: string;
  start_at: string;
  end_at: string;
}

const WeeklyChallengeBanner = () => {
  const { data: challenge, isLoading } = useQuery({
    queryKey: ['current-challenge'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_challenge');
      if (error) throw error;
      return data?.[0] as Challenge | null;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading || !challenge) {
    return null;
  }

  const endDate = new Date(challenge.end_at);
  const now = new Date();
  const timeLeft = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  // Dynamic gradient based on mood
  const getMoodGradient = (moodName: string) => {
    const moodColors = {
      'happy': 'from-yellow-400 via-orange-400 to-pink-400',
      'sad': 'from-blue-400 via-indigo-400 to-purple-400',
      'energetic': 'from-red-400 via-pink-400 to-purple-400',
      'chill': 'from-green-400 via-blue-400 to-purple-400',
      'romantic': 'from-pink-400 via-rose-400 to-red-400',
      'nostalgic': 'from-amber-400 via-orange-400 to-yellow-400',
      'angry': 'from-red-500 via-red-400 to-orange-400',
      'peaceful': 'from-emerald-400 via-teal-400 to-cyan-400',
    };
    
    const normalizedMood = moodName.toLowerCase();
    return moodColors[normalizedMood as keyof typeof moodColors] || 'from-purple-400 via-pink-400 to-blue-400';
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-r ${getMoodGradient(challenge.mood_name)} p-6 mb-6 border-0 shadow-2xl`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Weekly Challenge</h2>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <span className="text-lg mr-1">{challenge.mood_emoji}</span>
              {challenge.mood_name}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 text-white/90">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ending soon!'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-5 h-5 text-white/80 flex-shrink-0" />
          <p className="text-white text-lg font-medium leading-tight">
            {challenge.prompt}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-white/80 text-sm">
            Drop a track matching the <strong>{challenge.mood_name}</strong> mood to enter automatically!
          </p>
          <div className="flex items-center space-x-2 text-white/60 text-xs">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <span>Live Challenge</span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 animate-pulse delay-1000"></div>
    </Card>
  );
};

export default WeeklyChallengeBanner;
