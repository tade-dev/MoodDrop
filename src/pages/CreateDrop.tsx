
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Mood {
  id: string;
  name: string;
  emoji: string;
}

const CreateDrop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedMoodId, setSelectedMoodId] = useState(searchParams.get('mood') || '');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
  };

  const validateSpotifyUrl = (url: string) => {
    const spotifyRegex = /^https:\/\/open\.spotify\.com\/(track|playlist|album)\/[a-zA-Z0-9]+/;
    return spotifyRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create drops",
        variant: "destructive"
      });
      return;
    }

    if (!validateSpotifyUrl(spotifyUrl)) {
      toast({
        title: "Invalid Spotify URL",
        description: "Please enter a valid Spotify track, playlist, or album URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('drops')
        .insert({
          user_id: user.id,
          mood_id: selectedMoodId,
          spotify_url: spotifyUrl,
          song_title: songTitle,
          artist_name: artistName,
          caption: caption || null
        });

      if (error) throw error;

      toast({
        title: "Drop created! 🎵",
        description: "Your musical vibe has been shared"
      });
      
      navigate(`/mood/${selectedMoodId}`);
    } catch (error) {
      console.error('Error creating drop:', error);
      toast({
        title: "Error creating drop",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:text-purple-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create a Drop</h1>
          <p className="text-gray-300">Share your musical vibe with the world 🎵</p>
        </div>

        <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose a Mood
              </label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMoodId(mood.id)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      selectedMoodId === mood.id
                        ? 'bg-purple-600/50 border-2 border-purple-400'
                        : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-white text-sm font-medium">{mood.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spotify URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Spotify URL
              </label>
              <input
                type="url"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://open.spotify.com/track/..."
                required
              />
              <p className="text-gray-400 text-xs mt-1">
                Paste a Spotify track, playlist, or album link
              </p>
            </div>

            {/* Song Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song/Playlist Title
              </label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter the song or playlist title"
                required
              />
            </div>

            {/* Artist Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist/Creator
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter the artist or creator name"
                required
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Caption (Optional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Add a caption to your drop..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedMoodId}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200"
            >
              {loading ? 'Creating Drop...' : 'Create Drop 🎵'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateDrop;
