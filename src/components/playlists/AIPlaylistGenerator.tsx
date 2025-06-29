import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music, Heart, Flame, Headphones, Loader2, ExternalLink, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreateDropFromSong from './CreateDropFromSong';
import GoPremiumButton from '@/components/GoPremiumButton';

interface AIPlaylist {
  id: string;
  prompt: string;
  playlist_data: {
    title?: string;
    description?: string;
    songs?: Array<{
      title: string;
      artist: string;
    }>;
    mood_suggestion?: string;
    can_create_drops?: boolean;
  };
  created_at: string;
  user_id: string;
}

const AIPlaylistGenerator = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch AI playlists only if user is premium
  const { data: aiPlaylists = [], isLoading } = useQuery({
    queryKey: ['ai-playlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_playlists')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as AIPlaylist[];
    },
    enabled: !!user && isPremium,
  });

  const handleGeneratePlaylist = async () => {
    if (!user || !isPremium) {
      toast.error('🔒 Premium feature - Upgrade to MoodDrop+ to generate AI playlists!');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please describe your mood or what kind of playlist you want');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating playlist with prompt:', prompt);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-playlist', {
        body: { prompt: prompt.trim(), userId: user.id }
      });

      if (error) throw error;

      console.log('Generated playlist:', data);
      
      toast.success('🎵 AI Playlist generated successfully!');
      setPrompt('');
      queryClient.invalidateQueries({ queryKey: ['ai-playlists'] });
    } catch (error) {
      console.error('Error generating playlist:', error);
      toast.error('Failed to generate playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReaction = async (playlistId: string, reactionType: 'fire' | 'heart' | 'chill') => {
    if (!user || !isPremium) return;

    try {
      const { error } = await supabase
        .from('ai_playlist_reactions')
        .upsert({
          ai_playlist_id: playlistId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) throw error;
      
      toast.success('Reaction added!');
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const getSpotifySearchUrl = (song: { title: string; artist: string }) => {
    const query = `${song.title} ${song.artist}`;
    return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  };

  // Generate a Spotify track URL for the song (this would ideally come from the AI response)
  const getSpotifyTrackUrl = (song: { title: string; artist: string }) => {
    // For now, we'll generate a search URL that can be used as a starting point
    // In a real implementation, the AI would provide actual Spotify track URLs
    const query = `${song.title} ${song.artist}`;
    return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  };

  // Show premium gate if user is not premium
  if (!isPremium) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>AI Playlist Generator</span>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-8">
              <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-3">
                Unlock AI-Powered Playlists
              </h3>
              <p className="text-gray-300 mb-6">
                Get personalized Spotify song recommendations based on your mood and create MoodDrops instantly with AI-curated playlists.
              </p>
              <ul className="text-gray-400 text-sm space-y-2 mb-6">
                <li>✨ AI analyzes your mood and preferences</li>
                <li>🎵 Real Spotify song recommendations</li>
                <li>🚀 Instant MoodDrop creation from AI picks</li>
                <li>💭 Unlimited playlist generations</li>
              </ul>
              <GoPremiumButton size="lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generator Section */}
      <Card className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>AI Playlist Generator</span>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
              Premium
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Tell me how you're feeling and I'll recommend songs... (e.g., 'I'm feeling sad, recommend 10 melancholic tracks' or 'I need high energy workout music')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-black/20 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
            disabled={isGenerating}
          />
          <Button
            onClick={handleGeneratePlaylist}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI is curating your playlist...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Spotify Playlist
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Playlists */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Your AI Curated Playlists</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : aiPlaylists.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No AI playlists yet</h3>
              <p className="text-gray-400">Generate your first AI playlist by describing your mood above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {aiPlaylists.map((playlist) => (
              <Card key={playlist.id} className="bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-blue-900/20 backdrop-blur-sm border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {playlist.playlist_data?.title || 'AI Generated Playlist'}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">
                        "{playlist.prompt}"
                      </p>
                      <p className="text-sm text-gray-300 mb-3">
                        {playlist.playlist_data?.description || 'A playlist curated based on your mood'}
                      </p>
                      {playlist.playlist_data?.mood_suggestion && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 mb-3">
                          Suggested mood: {playlist.playlist_data.mood_suggestion}
                        </Badge>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Generated on {new Date(playlist.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Curated
                    </Badge>
                  </div>

                  {/* Songs List */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-white mb-3 flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      Recommended Songs ({playlist.playlist_data?.songs?.length || 0})
                    </h5>
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                      {playlist.playlist_data?.songs?.map((song, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{song.title}</p>
                            <p className="text-xs text-gray-400">{song.artist}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="text-green-400 hover:text-green-300 hover:bg-green-500/20 p-1"
                            >
                              <a
                                href={getSpotifySearchUrl(song)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Find on Spotify"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                            <CreateDropFromSong 
                              song={song}
                              spotifyUrl={getSpotifyTrackUrl(song)}
                              onDropCreated={() => {
                                toast.success('Drop created! Check your profile to see it.');
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReaction(playlist.id, 'fire')}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
                      >
                        <Flame className="w-4 h-4 mr-1" />
                        Fire
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReaction(playlist.id, 'heart')}
                        className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/20"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Love
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReaction(playlist.id, 'chill')}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                      >
                        <Headphones className="w-4 h-4 mr-1" />
                        Chill
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPlaylistGenerator;
