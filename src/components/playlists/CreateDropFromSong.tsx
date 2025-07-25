
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMoods } from '@/hooks/useMoods';

interface CreateDropFromSongProps {
  song: {
    title: string;
    artist: string;
  };
  spotifyUrl?: string;
  onDropCreated?: () => void;
}

const CreateDropFromSong = ({ song, spotifyUrl: prefilledSpotifyUrl, onDropCreated }: CreateDropFromSongProps) => {
  const { user } = useAuth();
  const { moods } = useMoods();
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedMoodId, setSelectedMoodId] = useState<string>('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Update spotify URL when prefilledSpotifyUrl changes
  useEffect(() => {
    if (prefilledSpotifyUrl) {
      setSpotifyUrl(prefilledSpotifyUrl);
    }
  }, [prefilledSpotifyUrl]);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSpotifyUrl(prefilledSpotifyUrl || '');
      setCaption('');
      setSelectedMoodId('');
    }
  };

  const handleCreateDrop = async () => {
    if (!user) {
      toast.error('Please log in to create a drop');
      return;
    }

    if (!selectedMoodId) {
      toast.error('Please select a mood');
      return;
    }

    if (!spotifyUrl.trim()) {
      toast.error('Please enter a Spotify URL');
      return;
    }

    // Basic Spotify URL validation - accept both track URLs and search URLs
    if (!spotifyUrl.includes('spotify.com/track/') && !spotifyUrl.includes('spotify.com/search/')) {
      toast.error('Please enter a valid Spotify URL');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Creating drop with data:', {
        user_id: user.id,
        song_title: song.title,
        artist_name: song.artist,
        spotify_url: spotifyUrl.trim(),
        caption: caption.trim() || null,
        mood_id: selectedMoodId,
        drop_type: 'song',
        group_id: crypto.randomUUID()
      });

      // Generate a unique group_id for this drop
      const groupId = crypto.randomUUID();

      const { error } = await supabase
        .from('drops')
        .insert({
          user_id: user.id,
          song_title: song.title,
          artist_name: song.artist,
          spotify_url: spotifyUrl.trim(),
          caption: caption.trim() || null,
          mood_id: selectedMoodId,
          drop_type: 'song',
          group_id: groupId
        });

      if (error) {
        console.error('Error creating drop:', error);
        throw error;
      }

      toast.success('🎵 Drop created successfully!');
      setIsOpen(false);
      setCaption('');
      setSelectedMoodId('');
      setSpotifyUrl('');
      onDropCreated?.();
    } catch (error) {
      console.error('Error creating drop:', error);
      toast.error('Failed to create drop. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Plus className="w-3 h-3 mr-1" />
          Create Drop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Music className="w-5 h-5 text-purple-400" />
            <span>Create Drop from "{song.title}"</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Spotify URL *
            </label>
            <input
              type="url"
              placeholder="https://open.spotify.com/track/..."
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="w-full bg-black/20 border-white/20 text-white placeholder-gray-400 rounded-md px-3 py-2 border focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              {prefilledSpotifyUrl ? 
                `AI recommendation link - you can search for the exact track and replace with the track URL` :
                `Find "${song.title}" by ${song.artist} on Spotify and paste the track URL here`
              }
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Mood *
            </label>
            <Select value={selectedMoodId} onValueChange={setSelectedMoodId}>
              <SelectTrigger className="bg-black/20 border-white/20 text-white">
                <SelectValue placeholder="Select a mood" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                {moods.map((mood) => (
                  <SelectItem key={mood.id} value={mood.id} className="text-white hover:bg-white/10">
                    {mood.emoji} {mood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Caption (optional)
            </label>
            <Textarea
              placeholder="Share why you love this song..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-black/20 border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              rows={3}
            />
          </div>

          <Button
            onClick={handleCreateDrop}
            disabled={isCreating || !selectedMoodId || !spotifyUrl.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
          >
            {isCreating ? 'Creating Drop...' : 'Create Drop'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDropFromSong;
