import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EnhancedDropCard from '@/components/EnhancedDropCard';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Music2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Drop {
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
}

const Home = () => {
  const [recentDrops, setRecentDrops] = useState<Drop[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchRecentDrops();
  }, [user, navigate]);

  const fetchRecentDrops = async () => {
    try {
      const { data: dropsData, error: dropsError } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (dropsError) throw dropsError;
      setRecentDrops(dropsData || []);

      if (dropsData && dropsData.length > 0) {
        const dropIds = dropsData.map(drop => drop.id);
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .in('drop_id', dropIds);

        if (!votesError) {
          setVotes(votesData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching recent drops:', error);
    }
  };

  const getDropVotes = (dropId: string) => {
    return votes.filter(vote => vote.drop_id === dropId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg animate-pulse">Loading your vibes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Welcome back! 🎵
              </h1>
              <p className="text-gray-300 text-lg">
                Ready to drop some fresh vibes today?
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/moods')}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 font-semibold px-4 py-2 rounded-full"
              >
                <Palette className="w-4 h-4 mr-2" />
                Moods
              </Button>
              <Button
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Drop
              </Button>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span>Latest Vibes</span>
            </h2>
          </div>

          {recentDrops.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <Music2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No drops yet</h3>
              <p className="text-gray-400 mb-6">Be the first to share your musical vibe!</p>
              <Button
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Create First Drop
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {recentDrops.map((drop, index) => (
                <div
                  key={drop.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EnhancedDropCard
                    drop={drop}
                    votes={getDropVotes(drop.id)}
                    onVote={fetchRecentDrops}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
