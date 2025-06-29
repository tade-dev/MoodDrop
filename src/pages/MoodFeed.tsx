
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UnifiedDropCard from '@/components/UnifiedDropCard';
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
  mood_ids?: string[];
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

      // Fetch drops for this mood - check both mood_id and mood_ids array
      const { data: dropsData, error: dropsError } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .or(`mood_id.eq.${moodId},mood_ids.cs.{${moodId}}`)
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 right-32 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed" />
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl animate-float-slow" />
        </div>
        
        <div className="relative z-10 text-white text-xl animate-pulse">Loading drops...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pt-20 pb-8">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-32 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 right-1/5 w-24 h-24 bg-indigo-500/12 rounded-full blur-2xl animate-float" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="text-white hover:text-purple-300 hover:bg-white/10"
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
          <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-6xl mb-4 animate-bounce">{mood.emoji}</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">{mood.name}</h1>
            <p className="text-gray-300">{drops.length} drops in this vibe</p>
          </div>
        )}

        {/* Drops */}
        <div className="space-y-6">
          {drops.length === 0 ? (
            <div className="text-center py-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
            drops.map((drop, index) => (
              <div
                key={drop.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 * (index + 3)}s` }}
              >
                <UnifiedDropCard
                  drop={drop}
                  votes={getDropVotes(drop.id)}
                  onVote={fetchMoodAndDrops}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodFeed;
