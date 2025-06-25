
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Sparkles, AlertCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateDropForm, DropFormData } from '@/utils/dropValidation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDropLimit } from '@/hooks/useDropLimit';
import { useMoods } from '@/hooks/useMoods';
import CreateDropHeader from '@/components/create-drop/CreateDropHeader';
import DropLimitAlert from '@/components/create-drop/DropLimitAlert';
import DropFormFields from '@/components/create-drop/DropFormFields';
import MoodSelector from '@/components/create-drop/MoodSelector';

const CreateDrop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  
  // Form state
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [artistName, setArtistName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [dropType, setDropType] = useState('song');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks
  const { location: userLocation } = useGeolocation();
  const { canCreateDrop, thisMonthDropCount } = useDropLimit();
  const { moods } = useMoods();

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods(prev => {
      if (prev.includes(moodId)) {
        return prev.filter(id => id !== moodId);
      } else {
        return [...prev, moodId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateDrop && !isPremium) {
      toast({
        title: "Monthly limit reached",
        description: "Free users can create 3 drops per month. Upgrade to Premium for unlimited drops!",
        variant: "destructive"
      });
      return;
    }

    const formData: DropFormData = {
      spotifyUrl,
      artistName,
      songTitle,
      caption,
      selectedMoods,
      dropType
    };

    const validation = validateDropForm(formData);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a single drop with multiple moods
      const { data, error } = await supabase
        .from('drops')
        .insert({
          user_id: user.id,
          spotify_url: spotifyUrl,
          artist_name: artistName.trim() || 'Unknown Artist',
          song_title: songTitle.trim() || 'Untitled',
          caption: caption.trim() || null,
          mood_id: selectedMoods[0], // Keep first mood for backward compatibility
          mood_ids: selectedMoods, // New multi-mood field
          latitude: userLocation?.lat || null,
          longitude: userLocation?.lng || null,
          drop_type: dropType
        })
        .select()
        .single();

      if (error) throw error;

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
        <CreateDropHeader />

        {/* Drop Limit Warning for Free Users */}
        {!isPremium && (
          <DropLimitAlert 
            thisMonthDropCount={thisMonthDropCount}
            canCreateDrop={canCreateDrop}
          />
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
              <DropFormFields
                spotifyUrl={spotifyUrl}
                setSpotifyUrl={setSpotifyUrl}
                dropType={dropType}
                setDropType={setDropType}
                artistName={artistName}
                setArtistName={setArtistName}
                songTitle={songTitle}
                setSongTitle={setSongTitle}
                caption={caption}
                setCaption={setCaption}
              />
              
              <MoodSelector
                moods={moods}
                selectedMoods={selectedMoods}
                onMoodToggle={handleMoodToggle}
              />
              
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
