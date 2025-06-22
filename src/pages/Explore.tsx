
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, TrendingUp, Star, Users, Heart, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import TrendingMoodsCarousel from '@/components/explore/TrendingMoodsCarousel';
import HotDropsGrid from '@/components/explore/HotDropsGrid';
import PlaylistSpotlight from '@/components/explore/PlaylistSpotlight';
import CreatorLeaderboard from '@/components/explore/CreatorLeaderboard';
import NearbyVibes from '@/components/explore/NearbyVibes';
import SearchFilters from '@/components/explore/SearchFilters';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [sortFilter, setSortFilter] = useState('most-voted');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Request geolocation permission
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
          console.log('Geolocation permission denied or unavailable');
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-32 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 right-1/5 w-24 h-24 bg-indigo-500/12 rounded-full blur-2xl animate-float" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Explore the Vibe
          </h1>
          <p className="text-gray-400 text-lg">Discover trending moods, hot drops, and new music</p>
        </div>

        {/* Search & Filters */}
        <SearchFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          sortFilter={sortFilter}
          setSortFilter={setSortFilter}
        />

        {/* Trending Moods Section */}
        <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Trending Moods</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
          </div>
          <TrendingMoodsCarousel />
        </section>

        {/* Hot Drops Grid */}
        <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <Fire className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Hot Drops</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent" />
          </div>
          <HotDropsGrid timeFilter={timeFilter} sortFilter={sortFilter} />
        </section>

        {/* Playlist Spotlight */}
        <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Playlist Spotlight</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent" />
          </div>
          <PlaylistSpotlight />
        </section>

        {/* Nearby Vibes */}
        {userLocation && (
          <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Nearby Vibes</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-green-500/50 to-transparent" />
            </div>
            <NearbyVibes userLocation={userLocation} />
          </section>
        )}

        {/* Creator Leaderboard */}
        <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Creator Leaderboard</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
          </div>
          <CreatorLeaderboard />
        </section>
      </div>
    </div>
  );
};

export default Explore;
