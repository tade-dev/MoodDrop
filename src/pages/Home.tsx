
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EnhancedDropCard from '@/components/EnhancedDropCard';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Music2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeeklyChallengeBanner from '@/components/WeeklyChallengeBanner';

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = async (dropId: string) => {
    // Refetch only the votes for this specific drop to update the UI
    try {
      const { data: updatedVotes, error } = await supabase
        .from('votes')
        .select('*')
        .eq('drop_id', dropId);

      if (!error && updatedVotes) {
        // Update the votes state by replacing votes for this drop
        setVotes(prevVotes => {
          const otherVotes = prevVotes.filter(vote => vote.drop_id !== dropId);
          return [...otherVotes, ...updatedVotes];
        });
      }
    } catch (error) {
      console.error('Error updating votes:', error);
    }
  };

  const handleDropDeleted = (deletedDropId: string) => {
    // Immediately remove the drop from the state without refetching
    setRecentDrops(prevDrops => prevDrops.filter(drop => drop.id !== deletedDropId));
    // Also remove any votes for this drop
    setVotes(prevVotes => prevVotes.filter(vote => vote.drop_id !== deletedDropId));
  };

  const getDropVotes = (dropId: string) => {
    return votes.filter(vote => vote.drop_id === dropId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-base sm:text-lg animate-pulse text-center">Loading your vibes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Weekly Challenge Banner */}
        <WeeklyChallengeBanner />
        
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MoodDrop</span>
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Share your musical moments, discover new vibes, and connect with others through the power of music.
          </p>
        </div>

        {/* Main Feed */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span>Latest Vibes</span>
            </h2>
          </div>

          {recentDrops.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mx-2 sm:mx-0">
              <Music2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No drops yet</h3>
              <p className="text-gray-400 mb-4 sm:mb-6 px-4">Be the first to share your musical vibe!</p>
              <Button
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 w-full max-w-xs mx-auto"
              >
                Create First Drop
              </Button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {recentDrops.map((drop, index) => (
                <div
                  key={drop.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EnhancedDropCard
                    drop={drop}
                    votes={getDropVotes(drop.id)}
                    onVote={() => handleVoteUpdate(drop.id)}
                    onDropDeleted={() => handleDropDeleted(drop.id)}
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
