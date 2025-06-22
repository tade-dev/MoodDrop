
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MoodCard from '@/components/MoodCard';
import CreateMoodModal from '@/components/CreateMoodModal';
import EnhancedDropCard from '@/components/EnhancedDropCard';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  is_custom: boolean;
  created_by: string | null;
}

interface MoodWithDropCount extends Mood {
  dropCount: number;
}

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
  const [moods, setMoods] = useState<MoodWithDropCount[]>([]);
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
    
    fetchMoodsWithDropCounts();
    fetchRecentDrops();
  }, [user, navigate]);

  const fetchMoodsWithDropCounts = async () => {
    try {
      const { data: moodsData, error: moodsError } = await supabase
        .from('moods')
        .select('*')
        .order('created_at', { ascending: true });

      if (moodsError) throw moodsError;

      const moodsWithCounts = await Promise.all(
        (moodsData || []).map(async (mood) => {
          const { count, error } = await supabase
            .from('drops')
            .select('*', { count: 'exact', head: true })
            .eq('mood_id', mood.id);

          if (error) {
            console.error('Error fetching drop count for mood:', mood.name, error);
          }

          return {
            ...mood,
            dropCount: count || 0
          };
        })
      );

      setMoods(moodsWithCounts);
    } catch (error) {
      console.error('Error fetching moods:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleMoodClick = (moodId: string) => {
    navigate(`/mood/${moodId}`);
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
      <div className="max-w-7xl mx-auto">
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
            <Button
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Drop
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="xl:col-span-2 space-y-6">
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

          {/* Sidebar - Moods */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Mood Vibes</h2>
              <CreateMoodModal onMoodCreated={fetchMoodsWithDropCounts} />
            </div>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {moods.map((mood, index) => (
                <div
                  key={mood.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  <MoodCard
                    mood={mood}
                    dropCount={mood.dropCount}
                    onClick={() => handleMoodClick(mood.id)}
                  />
                </div>
              ))}
            </div>

            {moods.length === 0 && (
              <div className="text-center py-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-lg font-semibold text-white mb-2">No moods yet</h3>
                <p className="text-gray-400 text-sm">Create your first mood to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
