
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
  const [caption, setCaption] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [location, setLocation] = useState('');
  const [moods, setMoods] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canCreateDrop, setCanCreateDrop] = useState(true);
  const [todayDropCount, setTodayDropCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchMoods();
    checkDropLimit();
  }, [user, navigate]);

  const checkDropLimit = async () => {
    try {
      const { data, error } = await supabase.rpc('can_user_create_drop');
      if (error) throw error;
      
      setCanCreateDrop(data);
      
      // Get today's drop count for display
      const { data: dropData } = await supabase
        .from('daily_drops')
        .select('drop_count')
        .eq('user_id', user.id)
        .eq('drop_date', new Date().toISOString().split('T')[0])
        .single();
      
      setTodayDropCount(dropData?.drop_count || 0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canCreateDrop && !isPremium) {
      toast({
        title: "Daily limit reached",
        description: "Free users can create 3 drops per day. Upgrade to Premium for unlimited drops!",
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

      // Extract basic info from URL for display
      const urlObj = new URL(spotifyUrl);
      const pathParts = urlObj.pathname.split('/');
      const spotifyType = pathParts[1]; // track, album, or playlist
      const dropType = getDropTypeFromSpotifyUrl(spotifyUrl);

      const { error } = await supabase
        .from('drops')
        .insert({
          user_id: user.id,
          spotify_url: spotifyUrl,
          artist_name: 'Loading...', // Will be updated by the display component
          song_title: 'Loading...', // Will be updated by the display component
          caption: caption.trim() || null,
          mood_id: selectedMood,
          location_name: location.trim() || null,
          drop_type: dropType
        });

      if (error) throw error;

      // Increment daily drop count for non-premium users
      if (!isPremium) {
        await supabase.rpc('increment_daily_drop_count');
      }

      toast({
        title: "Drop created! 🎵",
        description: "Your musical vibe has been shared with the world"
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
                  Daily drops: {todayDropCount}/3 {!canCreateDrop && '(Limit reached)'}
                </span>
                <GoPremiumButton size="sm" variant="minimal" />
              </div>
            </AlertDescription>
          </Alert>
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
                <Textarea
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500 resize-none"
                />
              </div>
              
              <div>
                <Select onValueChange={setSelectedMood}>
                  <SelectTrigger className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 w-full justify-between">
                    <SelectValue placeholder="Select a mood" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 border-white/20 text-white">
                    {moods.map((mood) => (
                      <SelectItem key={mood.id} value={mood.id}>
                        {mood.emoji} {mood.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Input
                  type="text"
                  placeholder="Add location (optional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-black/80 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
                />
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
                  disabled={isSubmitting || !spotifyUrl || !selectedMood || (!canCreateDrop && !isPremium)}
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
