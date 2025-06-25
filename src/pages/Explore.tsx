
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, MapPin, Music, Filter, Clock, Flame } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SearchFilters from '@/components/explore/SearchFilters';
import TrendingMoods from '@/components/explore/TrendingMoods';
import HotDropsGrid from '@/components/explore/HotDropsGrid';
import PlaylistSpotlight from '@/components/explore/PlaylistSpotlight';
import NearbyDrops from '@/components/explore/NearbyDrops';
import WeeklyChallengeBanner from '@/components/WeeklyChallengeBanner';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [sortFilter, setSortFilter] = useState('hot');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user's location for nearby drops
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Weekly Challenge Banner */}
        <WeeklyChallengeBanner />
        
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            Explore the <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vibe</span>
          </h1>
          <SearchFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            sortFilter={sortFilter}
            setSortFilter={setSortFilter}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="hot" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-sm border border-white/10">
            <TabsTrigger value="hot" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <Flame className="w-4 h-4 mr-2" />
              Hot Drops
            </TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <Music className="w-4 h-4 mr-2" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="nearby" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <MapPin className="w-4 h-4 mr-2" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Hot Drops Tab */}
          <TabsContent value="hot" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-black/40 border-white/20 text-white">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortFilter} onValueChange={setSortFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-black/40 border-white/20 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="hot">🔥 Hottest</SelectItem>
                  <SelectItem value="recent">⏰ Most Recent</SelectItem>
                  <SelectItem value="votes">👍 Most Voted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <HotDropsGrid timeFilter={timeFilter} sortFilter={sortFilter} />
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="mt-6">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Music className="w-6 h-6 mr-2 text-purple-400" />
                  Featured Playlists
                </h2>
                <PlaylistSpotlight />
              </div>
            </div>
          </TabsContent>

          {/* Nearby Tab */}
          <TabsContent value="nearby" className="mt-6">
            {userLocation ? (
              <NearbyDrops userLocation={userLocation} />
            ) : (
              <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10">
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Location Access Required</h3>
                  <p className="text-gray-400 mb-4">
                    Enable location access to discover drops from users near you
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Enable Location
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="mt-6">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
                  Trending Moods
                </h2>
                <TrendingMoods />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
