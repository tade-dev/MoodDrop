
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MoodCard from '@/components/MoodCard';
import CreateMoodModal from '@/components/CreateMoodModal';
import { useAuth } from '@/contexts/AuthContext';
import { Palette, Plus } from 'lucide-react';
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

const Moods = () => {
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

  const handleMoodClick = (moodId: string) => {
    navigate(`/mood/${moodId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg animate-pulse">Loading moods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-32 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="relative z-10 p-4 md:p-6 max-w-6xl mx-auto pt-16 md:pt-6">
        {/* Header */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <Palette className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                Mood Vibes
              </h1>
              <p className="text-gray-300 text-base md:text-lg">
                Choose your vibe and explore the drops
              </p>
            </div>
            <CreateMoodModal onMoodCreated={fetchMoodsWithDropCounts} />
          </div>
        </div>

        {/* Moods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {moods.map((mood, index) => (
            <div
              key={mood.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
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
          <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 animate-fade-in">
            <div className="text-6xl mb-6">🎨</div>
            <h3 className="text-2xl font-semibold text-white mb-4">No moods yet</h3>
            <p className="text-gray-400 text-lg mb-8">Create your first mood to get started!</p>
            <CreateMoodModal onMoodCreated={fetchMoodsWithDropCounts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Moods;
