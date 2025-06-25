
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Music, MapPin, Sparkles, AlertCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateSpotifyUrl, getDropTypeFromSpotifyUrl } from '@/utils/spotifyHelpers';
import GoPremiumButton from '@/components/GoPremiumButton';

const CreateDrop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [artistName, setArtistName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [dropType, setDropType] = useState('song');
  const [moods, setMoods] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canCreateDrop, setCanCreateDrop] = useState(true);
  const [thisMonthDropCount, setThisMonthDropCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchMoods();
    checkDropLimit();
    getCurrentLocation();
  }, [user, navigate]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('Location captured:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Geolocation not available or permission denied');
          // Continue without location - it's optional
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  };

  const checkDropLimit = async () => {
    try {
      const { data, error } = await supabase.rpc('can_user_create_drop');
      if (error) throw error;
      
      setCanCreateDrop(data);
      
      // For display purposes, we'll estimate the count since we can't directly query monthly_drops yet
      // This will be updated once the TypeScript types are regenerated
      setThisMonthDropCount(isPremium ? 0 : (data ? 0 : 3));
    } catch (error) {
      console.error('Error checking drop limit:', error);
    }
  };

  const fetchMoods = async () => {
    try {
      let query = supabase.from('moods').select('*');
      
      // Non-premium users can only see public moods
      if (!isPremium) {
        query = query.or('is_custom.eq.false,and(is_custom.eq.true,created_by.eq.' + user.id + ')');
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) throw error;
      setMoods(data || []);
    } catch (error) {
      console.error('Error fetching moods:', error);
      toast({
        title: "Error",
        description: "Failed to load moods",
        variant: "destructive"
      });
    }
  };

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods(prev => {
      if (prev.includes(moodId)) {
        return prev.filter(id => id !== moodId);
      } else {
        return [...prev, moodId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canCreateDrop && !isPremium) {
      toast({
        title: "Monthly limit reached",
        description: "Free users can create 3 drops per month. Upgrade to Premium for unlimited drops!",
        variant: "destructive"
      });
      return;
    }

    if (selectedMoods.length === 0) {
      toast({
        title: "Select a mood",
        description: "Please select at least one mood for your drop",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const validation = validateSpotifyUrl(spotifyUrl);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Please enter a valid Spotify URL');
      }

      // Create multiple drops for each selected mood
      const dropPromises = selectedMoods.map(moodId => 
        supabase
          .from('drops')
          .insert({
            user_id: user.id,
            spotify_url: spotifyUrl,
            artist_name: artistName.trim() || 'Unknown Artist',
            song_title: songTitle.trim() || 'Untitled',
            caption: caption.trim() || null,
            mood_id: moodId,
            latitude: userLocation?.lat || null,
            longitude: userLocation?.lng || null,
            drop_type: dropType
          })
      );

      const results = await Promise.all(dropPromises);
      
      // Check if any inserts failed
      const failedInserts = results.filter(result => result.error);
      if (failedInserts.length > 0) {
        throw new Error(failedInserts[0].error.message);
      }

      // Increment monthly drop count for non-premium users
      if (!isPremium) {
        await supabase.rpc('increment_daily_drop_count');
      }

      toast({
        title: "Drop created! 🎵",
        description: `Your musical vibe has been shared with ${selectedMoods.length} mood${selectedMoods.length > 1 ? 's' : ''}`
      });

      navigate('/home');
    } catch (error) {
      console.error('Error creating drop:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create drop",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be signed in to create a drop.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Drop Your Vibe 🎵
          </h1>
          <p className="text-gray-300 text-lg">
            Share the music that matches your mood
          </p>
        </div>

        {/* Drop Limit Warning for Free Users */}
        {!isPremium && (
          <Alert className="mb-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-400/30">
            <Crown className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-200">
              <div className="flex items-center justify-between">
                <span>
                  Monthly drops: {thisMonthDropCount}/3 {!canCreateDrop && '(Limit reached)'}
                </span>
                <GoPremiumButton size="sm" variant="minimal" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Location Status */}
        {userLocation && (
          <div className="mb-4 text-center">
            <Badge variant="outline" className="text-green-400 border-green-400/30">
              <MapPin className="w-3 h-3 mr-1" />
              Location detected for nearby vibes
            </Badge>
          </div>
        )}

        {/* Main Form */}
        <Card className="bg-black/40 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create New Drop</span>
              {isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <Input
                  type="url"
                  placeholder="Enter Spotify URL"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
                />
              </div>

              <div>
                <Select onValueChange={setDropType} defaultValue="song">
                  <SelectTrigger className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 w-full justify-between">
                    <SelectValue placeholder="Select drop type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-white/20 text-white">
                    <SelectItem value="song">🎵 Song</SelectItem>
                    <SelectItem value="album">💿 Album</SelectItem>
                    <SelectItem value="playlist">📋 Playlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Artist Name"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Song Title"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
                />
              </div>
              
              <div>
                <Textarea
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Select Moods (You can select multiple)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {moods.map((mood) => (
                    <div
                      key={mood.id}
                      onClick={() => handleMoodToggle(mood.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedMoods.includes(mood.id)
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white'
                          : 'bg-black/60 border-white/20 text-gray-300 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{mood.emoji}</div>
                        <div className="text-xs font-medium">{mood.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedMoods.length > 0 && (
                  <div className="mt-2 text-sm text-gray-400">
                    Selected: {selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/home')}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting || !spotifyUrl || selectedMoods.length === 0 || (!canCreateDrop && !isPremium)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Drop It! 🎵
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDrop;
