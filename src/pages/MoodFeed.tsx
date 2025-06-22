
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import DropCard from '@/components/DropCard';
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

const MoodFeed = () => {
  const { moodId } = useParams();
  const navigate = useNavigate();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [mood, setMood] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moodId) {
      fetchMoodAndDrops();
    }
  }, [moodId]);

  const fetchMoodAndDrops = async () => {
    try {
      // Fetch mood info
      const { data: moodData, error: moodError } = await supabase
        .from('moods')
        .select('*')
        .eq('id', moodId)
        .single();

      if (moodError) throw moodError;
      setMood(moodData);

      // Fetch drops for this mood
      const { data: dropsData, error: dropsError } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .eq('mood_id', moodId)
        .order('created_at', { ascending: false });

      if (dropsError) throw dropsError;
      setDrops(dropsData || []);

      // Fetch votes for all drops
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
      console.error('Error fetching mood feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDropVotes = (dropId: string) => {
    return votes.filter(vote => vote.drop_id === dropId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading drops...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="text-white hover:text-purple-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={() => navigate(`/create?mood=${moodId}`)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Drop
          </Button>
        </div>

        {mood && (
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{mood.emoji}</div>
            <h1 className="text-3xl font-bold text-white mb-2">{mood.name}</h1>
            <p className="text-gray-300">{drops.length} drops in this vibe</p>
          </div>
        )}

        {/* Drops */}
        <div className="space-y-6">
          {drops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-white mb-2">No drops yet</h3>
              <p className="text-gray-400 mb-6">Be the first to share a song for this mood!</p>
              <Button
                onClick={() => navigate(`/create?mood=${moodId}`)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Create First Drop
              </Button>
            </div>
          ) : (
            drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                votes={getDropVotes(drop.id)}
                onVote={fetchMoodAndDrops}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodFeed;
