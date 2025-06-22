import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
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
  const [selectedMoodIds, setSelectedMoodIds] = useState<string[]>(
    searchParams.get('mood') ? [searchParams.get('mood')!] : []
  );
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

  const toggleMoodSelection = (moodId: string) => {
    setSelectedMoodIds(prev => 
      prev.includes(moodId)
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const removeMoodSelection = (moodId: string) => {
    setSelectedMoodIds(prev => prev.filter(id => id !== moodId));
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

    if (selectedMoodIds.length === 0) {
      toast({
        title: "Select at least one mood",
        description: "Please choose at least one mood for your drop",
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
      // Create drops for each selected mood
      const dropPromises = selectedMoodIds.map(moodId => 
        supabase
          .from('drops')
          .insert({
            user_id: user.id,
            mood_id: moodId,
            spotify_url: spotifyUrl,
            song_title: songTitle,
            artist_name: artistName,
            caption: caption || null
          })
      );

      const results = await Promise.all(dropPromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error('Some drops failed to create');
      }

      toast({
        title: "Drops created! 🎵",
        description: `Your musical vibe has been shared across ${selectedMoodIds.length} moods`
      });
      
      navigate('/home');
    } catch (error) {
      console.error('Error creating drops:', error);
      toast({
        title: "Error creating drops",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMoods = () => {
    return moods.filter(mood => selectedMoodIds.includes(mood.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-8">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="text-white hover:text-purple-300 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-4">Create a Drop</h1>
          <p className="text-gray-300 text-lg">Share your musical vibe with the world 🎵</p>
        </div>

        <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Selected Moods Display */}
            {selectedMoodIds.length > 0 && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Selected Moods ({selectedMoodIds.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {getSelectedMoods().map((mood) => (
                    <div
                      key={mood.id}
                      className="flex items-center space-x-2 bg-purple-600/30 border border-purple-400/50 rounded-full px-3 py-1 animate-scale-in"
                    >
                      <span className="text-lg">{mood.emoji}</span>
                      <span className="text-white text-sm font-medium">{mood.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMoodSelection(mood.id)}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Selection */}
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose Moods (Select multiple)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => toggleMoodSelection(mood.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 hover:scale-105 ${
                      selectedMoodIds.includes(mood.id)
                        ? 'bg-purple-600/50 border-2 border-purple-400 shadow-lg shadow-purple-500/25'
                        : 'bg-white/10 border-2 border-transparent hover:bg-white/20 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{mood.emoji}</span>
                      <span className="text-white text-sm font-medium leading-tight">{mood.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spotify URL */}
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Spotify URL
              </label>
              <input
                type="url"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                placeholder="https://open.spotify.com/track/..."
                required
              />
              <p className="text-gray-400 text-xs mt-1">
                Paste a Spotify track, playlist, or album link
              </p>
            </div>

            {/* Song Title */}
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Song/Playlist Title
              </label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                placeholder="Enter the song or playlist title"
                required
              />
            </div>

            {/* Artist Name */}
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist/Creator
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                placeholder="Enter the artist or creator name"
                required
              />
            </div>

            {/* Caption */}
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Caption (Optional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all duration-300"
                placeholder="Add a caption to your drop..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || selectedMoodIds.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
            >
              {loading ? 'Creating Drops...' : `Create Drop${selectedMoodIds.length > 1 ? 's' : ''} 🎵`}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateDrop;
