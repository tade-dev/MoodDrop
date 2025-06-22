
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

const Home = () => {
  const [defaultMoods, setDefaultMoods] = useState<Mood[]>([]);
  const [customMoods, setCustomMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/');
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
      
      const defaultMoodsList = data?.filter(mood => !mood.is_custom) || [];
      const customMoodsList = data?.filter(mood => mood.is_custom) || [];
      
      setDefaultMoods(defaultMoodsList);
      setCustomMoods(customMoodsList);
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
          <p className="text-gray-300 text-lg mb-6">
            What's your vibe today? 🎵
          </p>
          
          {/* Create Custom Mood Button */}
          <div className="mb-8">
            <CreateMoodModal onMoodCreated={fetchMoods} />
          </div>
        </div>

        {/* Default Moods Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Popular Moods</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {defaultMoods.map((mood) => (
              <MoodCard
                key={mood.id}
                mood={mood}
                onClick={() => handleMoodClick(mood.id)}
              />
            ))}
          </div>
        </div>

        {/* Custom Moods Section */}
        {customMoods.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Custom Moods</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {customMoods.map((mood) => (
                <MoodCard
                  key={mood.id}
                  mood={mood}
                  onClick={() => handleMoodClick(mood.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Custom Moods */}
        {customMoods.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Create your first custom mood to personalize your experience! 🎨
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
