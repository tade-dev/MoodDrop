
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';

interface NearbyVibesProps {
  userLocation: { lat: number; lng: number };
}

const NearbyVibes = ({ userLocation }: NearbyVibesProps) => {
  const { data: nearbyDrops, isLoading } = useQuery({
    queryKey: ['nearby-drops', userLocation.lat, userLocation.lng],
    queryFn: async () => {
      console.log('Fetching nearby drops for location:', userLocation);
      
      // Use a direct query instead of the RPC function to ensure we get all drops
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          moods!inner(id, name, emoji),
          profiles!inner(id, username)
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (error) {
        console.error('Error fetching nearby drops:', error);
        throw error;
      }
      
      // Calculate distance client-side and filter
      const dropsWithDistance = data
        .map(drop => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            Number(drop.latitude),
            Number(drop.longitude)
          );
          
          return {
            id: drop.id,
            song_title: drop.song_title,
            artist_name: drop.artist_name,
            spotify_url: drop.spotify_url,
            caption: drop.caption,
            mood_name: drop.moods.name,
            mood_emoji: drop.moods.emoji,
            username: drop.profiles.username,
            distance_km: distance,
            created_at: drop.created_at
          };
        })
        .filter(drop => drop.distance_km <= 50) // 50km radius
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, 10); // Limit to 10 results
      
      console.log('Nearby drops processed:', dropsWithDistance);
      return dropsWithDistance;
    },
  });

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${Math.round(distance)}km away`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!nearbyDrops?.length) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10">
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No drops found in your area yet</p>
          <p className="text-gray-500 text-sm mt-1">Be the first to drop a vibe nearby!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {nearbyDrops.map((drop) => (
        <Card
          key={drop.id}
          className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-green-400/50 transition-all duration-500 hover:scale-105 cursor-pointer group"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                    {drop.mood_emoji} {drop.mood_name}
                  </Badge>
                  <Badge variant="outline" className="text-gray-400 border-gray-500/30">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formatDistance(drop.distance_km)}
                  </Badge>
                </div>

                <h3 className="font-bold text-white mb-1 group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                  {drop.song_title}
                </h3>
                <p className="text-gray-300 text-sm mb-2">{drop.artist_name}</p>
                
                {drop.caption && (
                  <p className="text-gray-400 text-sm line-clamp-1 mb-2">{drop.caption}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>@{drop.username}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(drop.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NearbyVibes;
