
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MoodCard from '@/components/MoodCard';
import { useAuth } from '@/contexts/AuthContext';

interface Mood {
  id: string;
  name: string;
  emoji: string;
}

const Home = () => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchMoods();
  }, [user, navigate]);

  const fetchMoods = async () => {
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMoods(data || []);
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading moods...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            MoodDrop
          </h1>
          <p className="text-gray-300 text-lg">
            What's your vibe today? 🎵
          </p>
        </div>

        {/* Moods Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moods.map((mood) => (
            <MoodCard
              key={mood.id}
              mood={mood}
              onClick={() => handleMoodClick(mood.id)}
            />
          ))}
        </div>

        {/* Custom mood hint */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Can't find your vibe? Create a custom mood! 🎨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
