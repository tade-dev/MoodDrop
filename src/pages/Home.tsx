
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MoodCard from '@/components/MoodCard';
import CreateMoodModal from '@/components/CreateMoodModal';
import { useAuth } from '@/contexts/AuthContext';

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

const Home = () => {
  const [moods, setMoods] = useState<MoodWithDropCount[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    fetchMoodsWithDropCounts();
  }, [user, navigate]);

  const fetchMoodsWithDropCounts = async () => {
    try {
      // Fetch moods
      const { data: moodsData, error: moodsError } = await supabase
        .from('moods')
        .select('*')
        .order('created_at', { ascending: true });

      if (moodsError) throw moodsError;

      // Fetch drop counts for each mood
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

  const handleMoodClick = (moodId: string) => {
    navigate(`/mood/${moodId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center pt-20">
        <div className="text-white text-xl animate-pulse">Loading moods...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Animated Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-6 animate-pulse">
            MoodDrop
          </h1>
          <p className="text-gray-300 text-xl mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            What's your vibe today? 🎵
          </p>
          
          {/* Create Custom Mood Button */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CreateMoodModal onMoodCreated={fetchMoodsWithDropCounts} />
          </div>
        </div>

        {/* Moods Grid with staggered animations */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            Choose Your Mood
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {moods.map((mood, index) => (
              <div
                key={mood.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <MoodCard
                  mood={mood}
                  dropCount={mood.dropCount}
                  onClick={() => handleMoodClick(mood.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {moods.length === 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-semibold text-white mb-4">No moods available</h3>
            <p className="text-gray-400 text-lg">
              Create your first custom mood and start dropping those vibes! 🎨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
